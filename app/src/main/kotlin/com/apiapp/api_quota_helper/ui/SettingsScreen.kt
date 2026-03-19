package com.apiapp.api_quota_helper.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.apiapp.api_quota_helper.BuildConfig
import com.apiapp.api_quota_helper.data.model.AppSettings
import com.apiapp.api_quota_helper.data.service.LogBuffer
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

// 手写JSON格式化（不用org.json避免崩溃）
private fun formatJson(jsonString: String): String {
    if (jsonString.isEmpty()) return jsonString
    val result = StringBuilder()
    var indent = 0
    var inString = false
    var escape = false
    var prevWasClose = false

    for (char in jsonString) {
        when {
            escape -> {
                result.append(char)
                escape = false
                prevWasClose = false
            }
            char == '\\' -> {
                result.append(char)
                escape = true
            }
            inString -> {
                result.append(char)
                if (char == '"' && !escape) {
                    inString = false
                    prevWasClose = false
                }
            }
            char == '"' -> {
                result.append(char)
                inString = true
                prevWasClose = false
            }
            char == '{' || char == '[' -> {
                if (!prevWasClose) {
                    result.append('\n')
                    result.append("  ".repeat(indent))
                }
                result.append(char)
                indent++
                prevWasClose = false
            }
            char == '}' || char == ']' -> {
                indent--
                if (prevWasClose) {
                    // Don't add newline before consecutive closes
                } else {
                    result.append('\n')
                    result.append("  ".repeat(indent))
                }
                result.append(char)
                prevWasClose = true
            }
            char == ':' -> {
                result.append(char)
                result.append(' ')
                prevWasClose = false
            }
            char == ',' -> {
                result.append(char)
                result.append('\n')
                result.append("  ".repeat(indent))
                prevWasClose = false
            }
            char == ' ' -> {
                // skip extra spaces
            }
            else -> {
                if (prevWasClose) {
                    result.append('\n')
                    result.append("  ".repeat(indent))
                }
                result.append(char)
                prevWasClose = false
            }
        }
    }
    return result.toString().trim()
}

data class UpdateInfo(
    val version: String,
    val downloadUrl: String,
    val releaseNotes: String
)

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

    // 更新检查状态
    var updateInfo by remember { mutableStateOf<UpdateInfo?>(null) }
    var isCheckingUpdate by remember { mutableStateOf(false) }
    var updateCheckError by remember { mutableStateOf<String?>(null) }

    // 检查更新
    fun checkForUpdate() {
        isCheckingUpdate = true
        updateCheckError = null
        kotlinx.coroutines.MainScope().launch {
            try {
                val apiUrl = URL("https://api.github.com/repos/raopan2021/api_quota_helper/releases/latest")
                val conn = apiUrl.openConnection() as HttpURLConnection
                conn.requestMethod = "GET"
                conn.setRequestProperty("Accept", "application/vnd.github+json")
                conn.setRequestProperty("X-GitHub-Api-Version", "2022-11-28")
                conn.connectTimeout = 10000
                conn.readTimeout = 10000

                val responseCode = conn.responseCode
                val responseMessage = conn.responseMessage ?: ""

                if (responseCode == 200) {
                    val reader = java.io.BufferedReader(java.io.InputStreamReader(conn.inputStream))
                    val response = reader.readText()
                    reader.close()
                    conn.disconnect()

                    try {
                        val json = JSONObject(response)
                        val tagName = json.getString("tag_name").removePrefix("v")
                        val latestVersion = tagName
                        val currentVersion = BuildConfig.VERSION_NAME

                        val needsUpdate = try {
                            val latest = latestVersion.split(".").map { it.toInt() }
                            val current = currentVersion.split(".").map { it.toInt() }
                            val size = maxOf(latest.size, current.size)
                            val latestPadded = latest + List(size - latest.size) { 0 }
                            val currentPadded = current + List(size - current.size) { 0 }
                            latestPadded.zip(currentPadded).any { it.first > it.second }
                        } catch (e: Exception) {
                            latestVersion != currentVersion
                        }

                        if (needsUpdate) {
                            val assets = json.optJSONArray("assets") ?: JSONArray()
                            var downloadUrl: String? = null
                            if (assets.length() > 0) {
                                for (i in 0 until assets.length()) {
                                    val asset = assets.getJSONObject(i)
                                    if (asset.getString("name").endsWith(".apk")) {
                                        downloadUrl = asset.getString("browser_download_url")
                                        break
                                    }
                                }
                            }
                            updateInfo = UpdateInfo(
                                version = latestVersion,
                                downloadUrl = downloadUrl ?: json.getString("html_url"),
                                releaseNotes = json.optString("body", "")
                            )
                            LogBuffer.logResponse(
                                logType = "检查更新",
                                username = "检查更新",
                                requestBody = "当前版本: $currentVersion",
                                success = true,
                                responseCode = 200,
                                responseMessage = "发现新版本 v$latestVersion",
                                responseBody = response
                            )
                        } else {
                            LogBuffer.logResponse(
                                logType = "检查更新",
                                username = "检查更新",
                                requestBody = "当前版本: $currentVersion",
                                success = true,
                                responseCode = 200,
                                responseMessage = "已是最新版本 v$currentVersion",
                                responseBody = response
                            )
                        }
                    } catch (e: java.lang.Exception) {
                        LogBuffer.logResponse(
                            logType = "检查更新",
                            username = "检查更新",
                            requestBody = "",
                            success = false,
                            responseCode = responseCode,
                            responseMessage = "解析响应失败",
                            responseBody = "",
                            errorMessage = "${e::class.java.simpleName}: ${e.message}"
                        )
                        updateCheckError = "解析响应失败"
                    }
                } else {
                    updateCheckError = "检查更新失败: HTTP $responseCode"
                    LogBuffer.logResponse(
                        logType = "检查更新",
                        username = "检查更新",
                        requestBody = "",
                        success = false,
                        responseCode = responseCode,
                        responseMessage = "HTTP $responseCode $responseMessage",
                        responseBody = "",
                        errorMessage = "检查更新失败: HTTP $responseCode"
                    )
                }
            } catch (e: java.lang.Exception) {
                val errorDetail = "${e::class.java.simpleName}: ${e.message}"
                val errorMessage = when {
                    e.message.isNullOrEmpty() -> "网络异常，请检查网络连接"
                    e.message!!.contains("Unable to resolve host", ignoreCase = true) ||
                    e.message!!.contains("No address associated", ignoreCase = true) -> "网络连接失败，请检查网络"
                    e.message!!.contains("timeout", ignoreCase = true) ||
                    e.message!!.contains("timed out", ignoreCase = true) -> "连接超时，请稍后重试"
                    e.message!!.contains("reset", ignoreCase = true) ||
                    e.message!!.contains("refused", ignoreCase = true) -> "连接被拒绝，请稍后重试"
                    else -> "检查更新失败"
                }
                updateCheckError = errorMessage
                LogBuffer.logResponse(
                    logType = "检查更新",
                    username = "检查更新",
                    requestBody = "",
                    success = false,
                    responseCode = 0,
                    responseMessage = "检查更新失败",
                    responseBody = "",
                    errorMessage = if (e.message.isNullOrEmpty()) errorMessage else errorDetail
                )
            } finally {
                isCheckingUpdate = false
            }
        }
    }

    // 首次进入设置时检查更新
    LaunchedEffect(Unit) {
        checkForUpdate()
    }

    // 下载并安装
    fun downloadAndInstall(downloadUrl: String) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl))
            context.startActivity(intent)
        } catch (e: Exception) {
            // 如果无法直接下载，打开浏览器
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl))
            context.startActivity(intent)
        }
    }

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

                    // 更新提示
                    if (updateInfo != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.primaryContainer
                            )
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "发现新版本: v${updateInfo!!.version}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Button(
                                        onClick = { downloadAndInstall(updateInfo!!.downloadUrl) }
                                    ) {
                                        Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text("打开下载页")
                                    }
                                }
                                if (updateInfo!!.releaseNotes.isNotEmpty()) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Text(
                                        text = updateInfo!!.releaseNotes,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = updateInfo!!.downloadUrl,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                )
                            }
                        }
                    } else if (updateCheckError != null) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = updateCheckError!!,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        OutlinedButton(
                            onClick = { checkForUpdate() },
                            enabled = !isCheckingUpdate
                        ) {
                            if (isCheckingUpdate) {
                                CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(18.dp))
                            }
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (isCheckingUpdate) "检查中..." else "检查更新")
                        }

                        FilledTonalButton(
                            onClick = {
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/raopan2021/api_quota_helper/releases")))
                            }
                        ) {
                            Icon(Icons.Default.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("下载更新")
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogScreen(onBack: () -> Unit) {
    val context = LocalContext.current
    var showDeleteAllConfirm by remember { mutableStateOf(false) }
    var showCopiedTip by remember { mutableStateOf(false) }
    var refreshKey by remember { mutableIntStateOf(0) }
    var selectedLogType by remember { mutableStateOf<String?>(null) }

    // 每次访问时获取最新日志
    val allLogs = remember(refreshKey) { LogBuffer.getAll() }
    val logs = if (selectedLogType != null) allLogs.filter { it.logType == selectedLogType } else allLogs

    // 获取所有日志类型
    val logTypes = remember(allLogs) { allLogs.map { it.logType }.distinct().sorted() }

    LaunchedEffect(showCopiedTip) {
        if (showCopiedTip) {
            kotlinx.coroutines.delay(1500)
            showCopiedTip = false
        }
    }

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
                    IconButton(onClick = { showDeleteAllConfirm = true }) {
                        Icon(Icons.Default.DeleteSweep, contentDescription = "清空全部")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { refreshKey++ },
                containerColor = MaterialTheme.colorScheme.primaryContainer
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "刷新")
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (logs.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        if (selectedLogType != null) "暂无「$selectedLogType」相关日志" else "暂无日志",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            } else {
                Column(modifier = Modifier.fillMaxSize()) {
                    // 左滑删除提示
                    if (logs.isNotEmpty()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.TouchApp,
                                contentDescription = null,
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                "左滑可删除",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                            )
                        }
                    }

                    // 分类筛选
                    if (logTypes.isNotEmpty()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = selectedLogType == null,
                                onClick = { selectedLogType = null },
                                label = { Text("全部") }
                            )
                            logTypes.forEach { type ->
                                FilterChip(
                                    selected = selectedLogType == type,
                                    onClick = {
                                        selectedLogType = if (selectedLogType == type) null else type
                                    },
                                    label = { Text(type) }
                                )
                            }
                        }
                    }

                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(logs, key = { it.id }) { entry ->
                            SwipeToDeleteCard(
                                entry = entry,
                                onCopy = {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    clipboard.setPrimaryClip(ClipData.newPlainText("log", LogBuffer.getAsString(entry)))
                                    showCopiedTip = true
                                }
                            )
                        }
                    }
                }
            }

            if (showCopiedTip) {
                Snackbar(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(16.dp),
                    action = {}
                ) {
                    Text("已复制到剪贴板")
                }
            }
        }
    }

    if (showDeleteAllConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteAllConfirm = false },
            title = { Text("确认清空") },
            text = { Text("确定要清空所有日志吗？此操作不可恢复。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        LogBuffer.clear()
                        showDeleteAllConfirm = false
                    }
                ) {
                    Text("清空", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteAllConfirm = false }) {
                    Text("取消")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SwipeToDeleteCard(
    entry: LogBuffer.LogEntry,
    onCopy: () -> Unit
) {
    LogEntryCardContent(entry = entry, onCopy = onCopy)
}

@Composable
fun LogEntryCardContent(
    entry: LogBuffer.LogEntry,
    onCopy: () -> Unit
) {
    val backgroundColor = if (entry.success) {
        Color(0xFF4CAF50).copy(alpha = 0.1f)
    } else {
        Color(0xFFF44336).copy(alpha = 0.1f)
    }
    val accentColor = if (entry.success) Color(0xFF4CAF50) else Color(0xFFF44336)

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = backgroundColor)
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            // 顶部：状态 + 时间 + 复制按钮
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = if (entry.success) "成功" else "失败",
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                        color = accentColor
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        imageVector = if (entry.success) Icons.Default.CheckCircle else Icons.Default.Error,
                        contentDescription = null,
                        tint = accentColor,
                        modifier = Modifier.size(16.dp)
                    )
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = entry.time,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = onCopy,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            Icons.Default.ContentCopy,
                            contentDescription = "复制",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // 用户名
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = entry.username,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            // 请求体
            if (entry.requestBody.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Upload,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "请求",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = formatJson(entry.requestBody),
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                )
            }

            // 响应码和消息
            Spacer(modifier = Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Code,
                    contentDescription = null,
                    modifier = Modifier.size(14.dp),
                    tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "响应: ${entry.responseCode} ${entry.responseMessage}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                )
            }

            // 错误消息或响应体
            if (entry.errorMessage != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = entry.errorMessage,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFFF44336)
                )
            } else if (entry.responseBody.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = formatJson(entry.responseBody),
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f)
                )
            }
        }
    }
}

