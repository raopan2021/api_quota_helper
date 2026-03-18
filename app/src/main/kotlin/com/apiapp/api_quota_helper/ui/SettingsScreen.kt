package com.apiapp.api_quota_helper.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.apiapp.api_quota_helper.BuildConfig
import com.apiapp.api_quota_helper.data.model.AppSettings
import com.apiapp.api_quota_helper.data.service.LogBuffer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    settings: AppSettings,
    onDarkModeChange: (Boolean) -> Unit,
    onRefreshIntervalChange: (Int) -> Unit,
    onBack: () -> Unit,
    onShowLogs: () -> Unit
) {
    val context = LocalContext.current
    var interval by remember { mutableFloatStateOf(settings.refreshIntervalMinutes.toFloat()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("设置") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // 主题设置
            Text(
                text = "主题",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        if (settings.darkMode) Icons.Default.DarkMode else Icons.Default.LightMode,
                        contentDescription = null
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("暗黑模式")
                }
                Switch(
                    checked = settings.darkMode,
                    onCheckedChange = onDarkModeChange
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 定时刷新设置
            Text(
                text = "定时刷新",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            Text("刷新间隔", style = MaterialTheme.typography.bodyMedium)
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Slider(
                    value = interval,
                    onValueChange = { interval = it },
                    onValueChangeFinished = { onRefreshIntervalChange(interval.toInt()) },
                    valueRange = 5f..120f,
                    steps = 22,
                    modifier = Modifier.weight(1f)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("${interval.toInt()} 分钟")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 调试
            Text(
                text = "调试",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            Button(
                onClick = onShowLogs,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Terminal, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("查看日志")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 关于
            Text(
                text = "关于",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "API 额度助手",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("版本: ${BuildConfig.VERSION_NAME}")
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("作者: raopan")
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        FilledTonalButton(
                            onClick = {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/raopan2021/api_quota_helper")))
                            }
                        ) {
                            Icon(Icons.Default.Code, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("GitHub")
                        }
                        
                        FilledTonalButton(
                            onClick = {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/raopan2021/api_quota_helper/releases")))
                            }
                        ) {
                            Icon(Icons.Default.Language, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("下载")
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 桌面组件
            Text(
                text = "桌面组件",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "添加桌面组件方法：",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("1. 长按手机桌面", style = MaterialTheme.typography.bodyMedium)
                    Text("2. 选择「小组件」", style = MaterialTheme.typography.bodyMedium)
                    Text("3. 找到「API额度」并添加", style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var logs by remember { mutableStateOf(LogBuffer.getAll()) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("网络日志") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        clipboard.setPrimaryClip(ClipData.newPlainText("logs", logs))
                    }) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "复制")
                    }
                    IconButton(onClick = {
                        LogBuffer.clear()
                        logs = ""
                    }) {
                        Icon(Icons.Default.Delete, contentDescription = "清除")
                    }
                    IconButton(onClick = {
                        logs = LogBuffer.getAll()
                    }) {
                        Icon(Icons.Default.Refresh, contentDescription = "刷新")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = if (logs.isEmpty()) "暂无日志，请先刷新账户" else "最近请求记录：",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier.fillMaxSize()
            ) {
                Text(
                    text = logs.ifEmpty { "暂无日志" },
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(12.dp)
                        .verticalScroll(rememberScrollState())
                )
            }
        }
    }
}
