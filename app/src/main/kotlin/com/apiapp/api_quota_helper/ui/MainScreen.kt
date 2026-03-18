package com.apiapp.api_quota_helper.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.apiapp.api_quota_helper.data.model.AccountType
import com.apiapp.api_quota_helper.data.model.AccountWithQuota
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: MainViewModel) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("API 额度助手") },
                actions = {
                    IconButton(onClick = { viewModel.refreshAllQuotas() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "刷新")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = { viewModel.showAddDialog() }) {
                Icon(Icons.Default.Add, contentDescription = "添加账户")
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
                LinearProgressIndicator(modifier = Modifier.align(Alignment.TopCenter))
            }
        }

        if (uiState.showAddDialog) {
            AddEditAccountDialog(
                editingAccount = uiState.editingAccount,
                onDismiss = { viewModel.dismissDialog() },
                onSave = { type, name, key -> viewModel.saveAccount(type, name, key) }
            )
        }
    }
}

@Composable
fun EmptyState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.Cloud,
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
            "点击 + 按钮添加 API 账户",
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

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = getAccountIcon(accountWithQuota.account.type),
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = accountWithQuota.account.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = accountWithQuota.account.type.displayName,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                }

                Box {
                    IconButton(onClick = { showMenu = true }) {
                        Icon(Icons.Default.MoreVert, contentDescription = "更多")
                    }
                    DropdownMenu(
                        expanded = showMenu,
                        onDismissRequest = { showMenu = false }
                    ) {
                        DropdownMenuItem(
                            text = { Text("刷新") },
                            onClick = { onRefresh(); showMenu = false },
                            leadingIcon = { Icon(Icons.Default.Refresh, null) }
                        )
                        DropdownMenuItem(
                            text = { Text("编辑") },
                            onClick = { onEdit(); showMenu = false },
                            leadingIcon = { Icon(Icons.Default.Edit, null) }
                        )
                        DropdownMenuItem(
                            text = { Text("删除") },
                            onClick = { onDelete(); showMenu = false },
                            leadingIcon = { Icon(Icons.Default.Delete, null) }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            when {
                accountWithQuota.error != null -> {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Error,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "错误: ${accountWithQuota.error}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error
                        )
                    }
                }
                accountWithQuota.quota != null -> {
                    val quota = accountWithQuota.quota
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "已使用: ${formatNumber(quota.used)} ${quota.unit}",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        if (quota.limit > 0) {
                            Text(
                                text = "限额: ${formatNumber(quota.limit)} ${quota.unit}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    LinearProgressIndicator(
                        progress = { quota.percentage.coerceIn(0f, 1f) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "更新于: ${formatTime(quota.lastUpdated)}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
                else -> {
                    Text(
                        text = "正在加载...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddEditAccountDialog(
    editingAccount: com.apiapp.api_quota_helper.data.model.Account?,
    onDismiss: () -> Unit,
    onSave: (AccountType, String, String) -> Unit
) {
    var selectedType by remember { mutableStateOf(editingAccount?.type ?: AccountType.OPENAI) }
    var name by remember { mutableStateOf(editingAccount?.name ?: "") }
    var apiKey by remember { mutableStateOf(editingAccount?.apiKey ?: "") }
    var typeExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (editingAccount != null) "编辑账户" else "添加账户") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // 账户类型
                ExposedDropdownMenuBox(
                    expanded = typeExpanded,
                    onExpandedChange = { typeExpanded = it }
                ) {
                    OutlinedTextField(
                        value = selectedType.displayName,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("类型") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = typeExpanded) },
                        modifier = Modifier.menuAnchor().fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = typeExpanded,
                        onDismissRequest = { typeExpanded = false }
                    ) {
                        AccountType.entries.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type.displayName) },
                                onClick = {
                                    selectedType = type
                                    typeExpanded = false
                                }
                            )
                        }
                    }
                }

                // 账户名称
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("名称") },
                    placeholder = { Text("例如: 我的 OpenAI") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // API Key
                OutlinedTextField(
                    value = apiKey,
                    onValueChange = { apiKey = it },
                    label = { Text("API Key") },
                    placeholder = { Text("sk-...") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onSave(selectedType, name, apiKey) },
                enabled = name.isNotBlank() && apiKey.isNotBlank()
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

fun getAccountIcon(type: AccountType) = when (type) {
    AccountType.OPENAI -> Icons.Default.Psychology
    AccountType.CLAUDE -> Icons.Default.Psychology
    AccountType.GOOGLE -> Icons.Default.Cloud
    AccountType.MOONSHOT -> Icons.Default.Rocket
    AccountType.DEEPSEEK -> Icons.Default.Star
    AccountType.XAI -> Icons.Default.Star
}

fun formatNumber(num: Long): String {
    return when {
        num >= 1_000_000_000 -> String.format("%.2fB", num / 1_000_000_000.0)
        num >= 1_000_000 -> String.format("%.2fM", num / 1_000_000.0)
        num >= 1_000 -> String.format("%.2fK", num / 1_000.0)
        else -> num.toString()
    }
}

fun formatTime(timestamp: Long): String {
    val sdf = SimpleDateFormat("MM-dd HH:mm", Locale.getDefault())
    return sdf.format(Date(timestamp))
}
