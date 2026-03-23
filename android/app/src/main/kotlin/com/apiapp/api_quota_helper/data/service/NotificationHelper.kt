package com.apiapp.api_quota_helper.data.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.apiapp.api_quota_helper.R
import com.apiapp.api_quota_helper.ui.MainActivity

/**
 * 通知栏辅助类
 * 用于在通知栏显示账户额度信息
 */
class NotificationHelper(private val context: Context) {

    companion object {
        const val CHANNEL_ID = "quota_channel"
        const val NOTIFICATION_ID = 1001
    }

    init {
        createNotificationChannel()
    }

    /**
     * 创建通知渠道（Android 8.0+需要）
     */
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "额度通知"
            val descriptionText = "显示账户额度信息"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false) // 不显示角标
            }
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    /**
     * 更新通知栏显示额度信息
     * @param accounts 要显示的账户额度信息列表
     */
    fun updateQuotaNotification(accounts: List<Pair<String, String>>) {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // 构建通知内容
        val title = "API 额度助手"
        val content = if (accounts.isEmpty()) {
            "暂无账户"
        } else if (accounts.size == 1) {
            "${accounts[0].first}: ${accounts[0].second}"
        } else {
            "${accounts[0].first}: ${accounts[0].second} 等${accounts.size}个账户"
        }

        // 创建点击意图（点击打开应用）
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 构建通知
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(content)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true) // 设置为持续通知（不可滑动删除）
            .setContentIntent(pendingIntent)
            .setAutoCancel(false)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    /**
     * 清除通知栏
     */
    fun clearNotification() {
        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.cancel(NOTIFICATION_ID)
    }
}
