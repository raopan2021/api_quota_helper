package com.apiapp.api_quota_helper

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews
import es.antonborri.home_widget.HomeWidgetPlugin

class MediumWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_medium)
            
            val widgetData = HomeWidgetPlugin.getData(context)
            val name = widgetData.getString("quota_name", "未设置") ?: "未设置"
            val percentStr = widgetData.getString("quota_percent", "0") ?: "0"
            val reset = widgetData.getString("quota_reset", "--") ?: "--"
            val percent = percentStr.toIntOrNull() ?: 0
            
            views.setTextViewText(R.id.widget_name, name)
            views.setTextViewText(R.id.widget_percent, "$percentStr%")
            views.setTextViewText(R.id.widget_reset, "刷新: $reset")
            views.setProgressBar(R.id.widget_progress, 100, percent, false)
            
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
