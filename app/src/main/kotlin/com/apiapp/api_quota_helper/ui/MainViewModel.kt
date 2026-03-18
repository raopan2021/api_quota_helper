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

data class MainUiState(
    val accounts: List<AccountWithQuota> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val showAddDialog: Boolean = false,
    val editingAccount: UserAccount? = null,
    val settings: AppSettings = AppSettings()
)

class MainViewModel(
    private val repository: AccountRepository,
    private val quotaService: QuotaService
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        loadAccounts()
        loadSettings()
    }

    private fun loadAccounts() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            repository.accounts.collect { accounts ->
                val accountsWithQuota = accounts.map { account ->
                    AccountWithQuota(account = account)
                }
                _uiState.update {
                    it.copy(
                        accounts = accountsWithQuota,
                        isLoading = false
                    )
                }
                // 自动刷新额度
                if (accounts.isNotEmpty()) {
                    refreshAllQuotas()
                }
            }
        }
    }

    private fun loadSettings() {
        viewModelScope.launch {
            repository.settings.collect { settings ->
                _uiState.update { it.copy(settings = settings) }
            }
        }
    }

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

    fun showAddDialog() {
        _uiState.update { it.copy(showAddDialog = true, editingAccount = null) }
    }

    fun showEditDialog(account: UserAccount) {
        _uiState.update { it.copy(showAddDialog = true, editingAccount = account) }
    }

    fun dismissDialog() {
        _uiState.update { it.copy(showAddDialog = false, editingAccount = null) }
    }

    fun saveAccount(username: String, token: String) {
        val trimmedUsername = username.trim()
        val trimmedToken = token.trim()
        
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
            
            // 直接刷新新账户的额度（不等 Flow 更新）
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
    }

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

    fun deleteAccount(accountId: String) {
        viewModelScope.launch {
            repository.deleteAccount(accountId)
        }
    }

    fun refreshAccountManually(account: UserAccount) {
        viewModelScope.launch {
            val currentAccounts = _uiState.value.accounts
            val updated = currentAccounts.map { awq ->
                if (awq.account.id == account.id) {
                    awq.copy(quota = null, error = null)
                } else {
                    awq
                }
            }
            _uiState.update { it.copy(accounts = updated) }
            refreshAccount(account)
        }
    }

    fun updateDarkMode(enabled: Boolean) {
        viewModelScope.launch {
            val newSettings = _uiState.value.settings.copy(darkMode = enabled)
            repository.saveSettings(newSettings)
            _uiState.update { it.copy(settings = newSettings) }
        }
    }

    fun updateRefreshInterval(minutes: Int) {
        viewModelScope.launch {
            val newSettings = _uiState.value.settings.copy(refreshIntervalMinutes = minutes)
            repository.saveSettings(newSettings)
            _uiState.update { it.copy(settings = newSettings) }
        }
    }

    override fun onCleared() {
        super.onCleared()
    }
}
