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
    val settings: AppSettings = AppSettings(),
    val showSettings: Boolean = false
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

    fun refreshAllQuotas() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            val currentAccounts = _uiState.value.accounts
            val updated = currentAccounts.map { awq ->
                if (awq.quota == null && awq.error == null) {
                    val result = quotaService.queryQuota(awq.account)
                    awq.copy(
                        quota = result.getOrNull(),
                        error = result.exceptionOrNull()?.message,
                        lastUpdated = System.currentTimeMillis()
                    )
                } else {
                    awq
                }
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
        viewModelScope.launch {
            val existingAccount = _uiState.value.editingAccount
            val account = UserAccount(
                id = existingAccount?.id ?: quotaService.generateAccountId(),
                username = username,
                token = token,
                createdAt = existingAccount?.createdAt ?: System.currentTimeMillis()
            )
            repository.saveAccount(account)
            dismissDialog()
            // 刷新该账户的额度
            refreshAccount(account)
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

    fun showSettings() {
        _uiState.update { it.copy(showSettings = true) }
    }

    fun dismissSettings() {
        _uiState.update { it.copy(showSettings = false) }
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
        quotaService.close()
    }
}
