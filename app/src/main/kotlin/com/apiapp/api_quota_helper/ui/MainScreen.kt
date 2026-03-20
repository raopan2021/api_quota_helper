package com.apiapp.api_quota_helper.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.apiapp.api_quota_helper.data.model.AccountWithQuota
import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.UserAccount
import com.apiapp.api_quota_helper.data.service.LogBuffer
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(
    viewModel: MainViewModel,
    onNavigateToSettings: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    // 监听 editingAccount 变化，自动显示编辑对话框
    LaunchedEffect(uiState.editingAccount) {
        if (uiState.editingAccount != null) {
            showAddDialog = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("API 额度助手") }
            )
        },
        floatingActionButton = {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                SmallFloatingActionButton(
                    onClick = onNavigateToSettings,
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                ) {
                    Icon(painter = Icons2.Settings(), contentDescription = "设置")
                }
                SmallFloatingActionButton(
                    onClick = { viewModel.refreshAllQuotas(force = true) },
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ) {
                    Icon(painter = Icons2.Refresh(), contentDescription = "刷新")
                }
                FloatingActionButton(onClick = { showAddDialog = true }) {
                    Icon(painter = Icons2.Add(), contentDescription = "添加账户")
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                uiState.accounts.isEmpty() -> {
                    EmptyState(modifier = Modifier.align(Alignment.Center))
                }
                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(uiState.accounts, key = { it.account.id }) { awq ->
                            AccountCard(
                                accountWithQuota = awq,
                                onEdit = { viewModel.showEditDialog(awq.account) },
                                onDelete = { viewModel.deleteAccount(awq.account.id) },
                                onRefresh = { viewModel.refreshAccountManually(awq.account) }
                            )
                        }
                    }
                }
            }

            if (uiState.isRefreshing) {
                LinearProgressIndicator(
                    modifier = Modifier
                        .fillMaxWidth()
                        .align(Alignment.TopCenter)
                )
            }
        }
    }

    if (showAddDialog) {
        AddEditAccountDialog(
            editingAccount = uiState.editingAccount,
            saveError = uiState.saveError,
            onDismiss = {
                showAddDialog = false
                viewModel.dismissDialog()
            },
            onSave = { username, token ->
                val ok = viewModel.saveAccount(username, token)
                if (ok) showAddDialog = false
            }
        )
    }
}

@Composable
fun EmptyState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(painter = Icons2.Cloud(),
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            "暂无账户",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            "点击 + 按钮添加账户",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.4f)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountCard(
    accountWithQuota: AccountWithQuota,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onRefresh: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }
    var showDeleteConfirm by remember { mutableStateOf(false) }

    val quota = accountWithQuota.quota
    val remainingPercent = quota?.let { (it.remaining / it.amount * 100) } ?: 0.0
    val isLoading = quota == null && accountWithQuota.error == null
    
    // 根据剩余额度比例确定颜色，加载状态用灰色
    val statusColor = when {
        isLoading -> Color(0xFF9E9E9E) // 灰色-加载中
        remainingPercent > 50 -> Color(0xFF4CAF50) // 绿色
        remainingPercent > 20 -> Color(0xFF2196F3) // 蓝色
        else -> Color(0xFFF44336) // 红色
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // 顶部状态条
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .background(statusColor)
            )
            
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(painter = Icons2.AccountCircle(),
                            contentDescription = null,
                            tint = statusColor,
                            modifier = Modifier.size(40.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                accountWithQuota.account.username,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold
                            )
                            if (quota != null) {
                                Row {
                                    Text(
                                        quota.plan_name,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                    Text(
                                        " · 剩余 ${quota.days_remaining} 天",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                        }
                    }
                    
                    // 剩余额度百分比
                    if (quota != null) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(statusColor.copy(alpha = 0.1f))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                "${String.format("%.1f", remainingPercent)}%",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = statusColor
                            )
                        }
                    } else if (isLoading) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(statusColor.copy(alpha = 0.1f))
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(14.dp),
                                    strokeWidth = 2.dp,
                                    color = statusColor
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    "加载中",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Bold,
                                    color = statusColor
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                when {
                    accountWithQuota.error != null -> {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(painter = Icons2.Error(),
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "错误: ${accountWithQuota.error}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                    quota != null -> {
                        // 额度信息 - 左侧显示
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Column {
                                    Text(
                                        "已用额度",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                    Text(
                                        "${String.format("%.1f", quota.amount_used)}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        "总额度",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                    Text(
                                        "${String.format("%.1f", quota.amount)}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        "剩余额度",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                                    )
                                    Text(
                                        "${String.format("%.1f", quota.remaining)}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        fontWeight = FontWeight.Bold,
                                        color = statusColor
                                    )
                                }
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        // 进度条
                        LinearProgressIndicator(
                            progress = { quota.usedPercentage.coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            color = statusColor,
                            trackColor = statusColor.copy(alpha = 0.2f),
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Column {
                                RelativeTimeText(
                                    timestamp = accountWithQuota.lastUpdated,
                                    prefix = "更新于: "
                                )
                                if (quota != null) {
                                    Spacer(modifier = Modifier.height(4.dp))
                                    ResetCountdown(resetTime = quota.next_reset_time)
                                }
                            }
                        }
                    }
                    else -> {
                        Text(
                            "正在加载...",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // 操作按钮
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onRefresh) {
                        Icon(painter = Icons2.Refresh(), contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("刷新")
                    }
                    TextButton(onClick = onEdit) {
                        Icon(painter = Icons2.Edit(), contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("编辑")
                    }
                    TextButton(onClick = { showDeleteConfirm = true }) {
                        Icon(painter = Icons2.Delete(), contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("删除")
                    }
                }
            }
        }
    }

    if (showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = { showDeleteConfirm = false },
            title = { Text("确认删除") },
            text = { Text("确定要删除账户 ${accountWithQuota.account.username} 吗？") },
            confirmButton = {
                TextButton(onClick = { onDelete(); showDeleteConfirm = false }) {
                    Text("删除", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteConfirm = false }) {
                    Text("取消")
                }
            }
        )
    }
}

@Composable
fun AddEditAccountDialog(
    editingAccount: UserAccount?,
    saveError: String?,
    onDismiss: () -> Unit,
    onSave: (String, String) -> Unit
) {
    var username by remember { mutableStateOf(editingAccount?.username ?: "") }
    var token by remember { mutableStateOf(editingAccount?.token ?: "") }
    var pasteContent by remember { mutableStateOf("") }

    fun doRecognize(text: String) {
        val result = parseAccountFromClipboard(text)
        if (result != null) {
            username = result.first
            token = result.second
            LogBuffer.logResponse(
                logType = "账户识别",
                username = "账户识别",
                requestBody = text,
                success = true,
                responseCode = 200,
                responseMessage = "识别成功",
                responseBody = "用户名：${result.first}，Token：${result.second}"
            )
        } else {
            LogBuffer.logResponse(
                logType = "账户识别",
                username = "账户识别",
                requestBody = text,
                success = false,
                responseCode = 0,
                responseMessage = "识别失败",
                responseBody = "",
                errorMessage = "无法识别：请确保包含「API Key」和「账户」字段"
            )
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (editingAccount != null) "编辑账户" else "添加账户") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("用户名") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = token,
                    onValueChange = { token = it },
                    label = { Text("Token (API Key)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                HorizontalDivider()

                Text(
                    text = "从剪贴板识别",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                OutlinedTextField(
                    value = pasteContent,
                    onValueChange = { pasteContent = it },
                    label = { Text("粘贴内容（支持识别 API Key 和账户）") },
                    minLines = 3,
                    maxLines = 6,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilledTonalButton(
                        onClick = {
                            if (pasteContent.isNotEmpty()) {
                                doRecognize(pasteContent)
                            }
                        },
                        enabled = pasteContent.isNotEmpty(),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(painter = Icons2.Search(), contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("识别")
                    }
                }
                // 识别结果错误提示
                if (saveError != null) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.errorContainer
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                painter = Icons2.Warning(),
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = saveError,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onSave(username, token) },
                enabled = username.isNotBlank() && token.isNotBlank()
            ) {
                Text("保存")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}

fun formatRelativeTime(timestamp: Long): String {
    if (timestamp == 0L) return "从未"
    val diff = System.currentTimeMillis() - timestamp
    val seconds = diff / 1000
    val minutes = seconds / 60
    val hours = minutes / 60
    val days = hours / 24

    return when {
        days > 0 -> "${days}天前"
        hours > 0 -> "${hours}小时前"
        minutes > 0 -> "${minutes}分钟前"
        seconds > 0 -> "${seconds}秒前"
        else -> "刚刚"
    }
}

@Composable
fun ResetCountdown(resetTime: String) {
    var countdown by remember { mutableStateOf("") }

    LaunchedEffect(resetTime) {
        while (true) {
            countdown = calculateCountdown(resetTime)
            delay(1000)
        }
    }

    if (countdown.isNotEmpty()) {
        Text(
            "距重置: $countdown",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
fun RelativeTimeText(timestamp: Long, prefix: String = "") {
    var relativeTime by remember { mutableStateOf(formatRelativeTime(timestamp)) }

    LaunchedEffect(timestamp) {
        while (true) {
            relativeTime = formatRelativeTime(timestamp)
            delay(1000)
        }
    }

    Text(
        text = "$prefix$relativeTime",
        style = MaterialTheme.typography.bodySmall,
        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
    )
}

private fun calculateCountdown(resetTime: String): String {
    if (resetTime.isEmpty()) return ""
    return try {
        val sdf = SimpleDateFormat("yyyy/MM/dd HH:mm:ss", Locale.getDefault())
        val resetDate = sdf.parse(resetTime) ?: return ""
        val now = System.currentTimeMillis()
        val diff = resetDate.time - now

        if (diff <= 0) return "已重置"

        val hours = diff / (1000 * 60 * 60)
        val minutes = (diff % (1000 * 60 * 60)) / (1000 * 60)
        val seconds = (diff % (1000 * 60)) / 1000

        "${hours}小时${minutes}分${seconds}秒"
    } catch (e: Exception) {
        ""
    }
}

/**
 * 从剪贴板文本自动识别账户信息
 * 支持格式：
 * API Key：sk-xxxx
 * 账户：username
 */
private fun parseAccountFromClipboard(text: String): Pair<String, String>? {
    if (text.isBlank()) return null

    // 提取 API Key（支持 "API Key：" 或 "API Key: "）
    val apiKey = Regex("""API Key[：:]\s*(\S+)""")
        .find(text)?.groupValues?.get(1)
        ?: return null

    // 提取账户名（支持 "账户：" 或 "账户: "）
    val username = Regex("""账户[：:]\s*(\S+)""")
        .find(text)?.groupValues?.get(1)
        ?: return null

    return Pair(username, apiKey)
}
