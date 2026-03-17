package com.apiapp.api_quota_helper

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetPlugin

class LargeWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_large)
            
            val widgetData = HomeWidgetPlugin.getData(context)
            val name = widgetData.getString("quota_name", "未设置") ?: "未设置"
            val percentStr = widgetData.getString("quota_percent", "0") ?: "0"
            val used = widgetData.getString("quota_used", "-") ?: "-"
            val remaining = widgetData.getString("quota_remaining", "-") ?: "-"
            val limit = widgetData.getString("quota_limit", "-") ?: "-"
            val reset = widgetData.getString("quota_reset", "--") ?: "--"
            val percent = percentStr.toIntOrNull() ?: 0
            
            views.setTextViewText(R.id.widget_name, name)
            views.setTextViewText(R.id.widget_percent, "$percentStr%")
            views.setTextViewText(R.id.widget_used, "已用: $used")
            views.setTextViewText(R.id.widget_remaining, "剩余: $remaining")
            views.setTextViewText(R.id.widget_limit, "总额: $limit")
            views.setTextViewText(R.id.widget_reset, "下次刷新: $reset")
            views.setProgressBar(R.id.widget_progress, 100, percent, false)
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
