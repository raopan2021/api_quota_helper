package com.apiapp.api_quota_helper.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.apiapp.api_quota_helper.data.model.AccountWithQuota
import com.apiapp.api_quota_helper.data.model.AppSettings
import com.apiapp.api_quota_helper.data.model.UserAccount
import com.apiapp.api_quota_helper.data.repository.AccountRepository
import com.apiapp.api_quota_helper.data.service.QuotaService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * 主页面 UI 状态
 * @param accounts 账户列表（带额度信息）
 * @param isLoading 是否正在加载
 * @param isRefreshing 是否正在刷新（显示顶部进度条）
 * @param showAddDialog 是否显示添加/编辑对话框
 * @param editingAccount 正在编辑的账户（null表示添加新账户）
 * @param settings 应用设置
 * @param saveError 保存时的错误信息
 */
data class MainUiState(
    val accounts: List<AccountWithQuota> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val showAddDialog: Boolean = false,
    val editingAccount: UserAccount? = null,
    val settings: AppSettings = AppSettings(),
    val saveError: String? = null
)

/**
 * 主页面 ViewModel
 * 管理账户列表、额度查询、设置保存等业务逻辑
 */
class MainViewModel(
    private val repository: AccountRepository,
    private val quotaService: QuotaService
) : ViewModel() {

    /** 私有状态流 */
    private val _uiState = MutableStateFlow(MainUiState())
    /** 公开的只读状态流 */
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        // 初始化时加载账户和设置
        loadAccounts()
        loadSettings()
    }

    /**
     * 加载账户列表
     * 从 DataStore 读取并订阅账户变化
     */
    private fun loadAccounts() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.accounts.collect { accounts ->
                // 将账户转换为带额度的形式（初始无额度）
                val accountsWithQuota = accounts.map { account ->
                    AccountWithQuota(account = account)
                }
                _uiState.update {
                    it.copy(
                        accounts = accountsWithQuota,
                        isLoading = false
                    )
                }
                // 有账户时自动刷新额度
                if (accounts.isNotEmpty()) {
                    refreshAllQuotas()
                }
            }
        }
    }

    /**
     * 加载应用设置
     * 从 DataStore 读取并订阅设置变化
     */
    private fun loadSettings() {
        viewModelScope.launch {
            repository.settings.collect { settings ->
                _uiState.update { it.copy(settings = settings) }
            }
        }
    }

    /**
     * 刷新所有账户的额度
     * @param force 是否强制刷新（true时会清空现有数据，显示加载状态）
     */
    fun refreshAllQuotas(force: Boolean = false) {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            val currentAccounts = _uiState.value.accounts

            // force=true 时先清空数据，显示加载状态
            val cleared = if (force) {
                currentAccounts.map { it.copy(quota = null, error = null) }
            } else {
                currentAccounts
            }
            _uiState.update { it.copy(accounts = cleared) }

            // 并发查询所有账户额度
            val updated = cleared.map { awq ->
                val result = quotaService.queryQuota(awq.account)
                awq.copy(
                    quota = result.getOrNull(),
                    error = result.exceptionOrNull()?.message,
                    lastUpdated = System.currentTimeMillis()
                )
            }
            _uiState.update { it.copy(accounts = updated, isRefreshing = false) }
        }
    }

    /** 显示添加账户对话框 */
    fun showAddDialog() {
        _uiState.update { it.copy(showAddDialog = true, editingAccount = null, saveError = null) }
    }

    /** 显示编辑账户对话框 */
    fun showEditDialog(account: UserAccount) {
        _uiState.update { it.copy(showAddDialog = true, editingAccount = account, saveError = null) }
    }

    /** 关闭对话框 */
    fun dismissDialog() {
        _uiState.update { it.copy(showAddDialog = false, editingAccount = null, saveError = null) }
    }

    /**
     * 保存账户（添加或更新）
     * @return 是否保存成功
     */
    fun saveAccount(username: String, token: String): Boolean {
        val trimmedUsername = username.trim()
        val trimmedToken = token.trim()

        // 检查重复（编辑时排除自身）
        val others = _uiState.value.accounts.filter { it.account.id != _uiState.value.editingAccount?.id }
        when {
            others.any { it.account.username == trimmedUsername } -> {
                _uiState.update { it.copy(saveError = "用户名「$trimmedUsername」已存在") }
                return false
            }
            others.any { it.account.token == trimmedToken } -> {
                _uiState.update { it.copy(saveError = "Token 已存在") }
                return false
            }
        }

        viewModelScope.launch {
            val existingAccount = _uiState.value.editingAccount
            val account = UserAccount(
                id = existingAccount?.id ?: quotaService.generateAccountId(),
                username = trimmedUsername,
                token = trimmedToken,
                createdAt = existingAccount?.createdAt ?: System.currentTimeMillis()
            )
            repository.saveAccount(account)
            dismissDialog()

            // 保存后立即刷新新账户的额度（不等 Flow 自动更新）
            val result = quotaService.queryQuota(account)
            val newAwq = AccountWithQuota(
                account = account,
                quota = result.getOrNull(),
                error = result.exceptionOrNull()?.message,
                lastUpdated = System.currentTimeMillis()
            )
            val currentAccounts = _uiState.value.accounts.toMutableList()
            val existingIndex = currentAccounts.indexOfFirst { it.account.id == account.id }
            if (existingIndex >= 0) {
                currentAccounts[existingIndex] = newAwq
            } else {
                currentAccounts.add(newAwq)
            }
            _uiState.update { it.copy(accounts = currentAccounts) }
        }
        return true
    }

    /**
     * 内部方法：刷新单个账户额度
     */
    private fun refreshAccount(account: UserAccount) {
        viewModelScope.launch {
            val result = quotaService.queryQuota(account)
            val currentAccounts = _uiState.value.accounts
            val updated = currentAccounts.map { awq ->
                if (awq.account.id == account.id) {
                    awq.copy(
                        quota = result.getOrNull(),
                        error = result.exceptionOrNull()?.message,
                        lastUpdated = System.currentTimeMillis()
                    )
                } else {
                    awq
                }
            }
            _uiState.update { it.copy(accounts = updated) }
        }
    }

    /** 删除账户 */
    fun deleteAccount(accountId: String) {
        viewModelScope.launch {
            repository.deleteAccount(accountId)
        }
    }

    /**
     * 手动刷新指定账户
     * 先显示加载状态，再查询额度
     */
    fun refreshAccountManually(account: UserAccount) {
        viewModelScope.launch {
            // 先显示加载状态
            val currentAccounts = _uiState.value.accounts
            val updated = currentAccounts.map { awq ->
                if (awq.account.id == account.id) {
                    awq.copy(quota = null, error = null)
                } else {
                    awq
                }
            }
            _uiState.update { it.copy(accounts = updated) }
            // 再查询
            refreshAccount(account)
        }
    }

    /** 更新深色模式设置 */
    fun updateDarkMode(enabled: Boolean) {
        viewModelScope.launch {
            val newSettings = _uiState.value.settings.copy(darkMode = enabled)
            repository.saveSettings(newSettings)
            _uiState.update { it.copy(settings = newSettings) }
        }
    }

    /** 更新刷新间隔 */
    fun updateRefreshInterval(seconds: Int) {
        viewModelScope.launch {
            val newSettings = _uiState.value.settings.copy(refreshIntervalSeconds = seconds)
            repository.saveSettings(newSettings)
            _uiState.update { it.copy(settings = newSettings) }
        }
    }

    override fun onCleared() {
        super.onCleared()
    }
}
