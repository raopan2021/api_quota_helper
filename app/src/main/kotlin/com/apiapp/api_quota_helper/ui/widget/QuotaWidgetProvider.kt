package com.apiapp.api_quota_helper.ui.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import android.app.PendingIntent
import com.apiapp.api_quota_helper.R
import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.UserAccount
import com.apiapp.api_quota_helper.data.repository.AccountRepository
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import java.text.SimpleDateFormat
import java.util.*

class QuotaWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // 第一个 widget 被创建时调用
    }

    override fun onDisabled(context: Context) {
        // 最后一个 widget 被删除时调用
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_quota)

            // 创建点击事件，打开应用
            val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_title, pendingIntent)

            // 从 DataStore 获取数据
            runBlocking {
                try {
                    val repository = AccountRepository(context)
                    val accounts = repository.accounts.first()
                    
                    if (accounts.isNotEmpty()) {
                        val account = accounts.first()
                        views.setTextViewText(R.id.widget_account, "账户: ${account.username}")
                        
                        // 显示最后更新时间
                        val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
                        views.setTextViewText(R.id.widget_update_time, "更新: ${sdf.format(Date())}")
                        
                        // TODO: 从本地缓存获取额度信息
                        // 完整刷新需要调用 API，这里显示上次缓存的数据
                        views.setTextViewText(R.id.widget_quota, "已用: - / -")
                        views.setTextViewText(R.id.widget_remaining, "剩余: -")
                    } else {
                        views.setTextViewText(R.id.widget_account, "账户: 未配置")
                        views.setTextViewText(R.id.widget_quota, "已用: -")
                        views.setTextViewText(R.id.widget_remaining, "剩余: -")
                        views.setTextViewText(R.id.widget_update_time, "更新: 从未")
                    }
                } catch (e: Exception) {
                    views.setTextViewText(R.id.widget_account, "账户: 加载失败")
                    views.setTextViewText(R.id.widget_quota, "已用: -")
                    views.setTextViewText(R.id.widget_remaining, "剩余: -")
                    views.setTextViewText(R.id.widget_update_time, "更新: 错误")
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
