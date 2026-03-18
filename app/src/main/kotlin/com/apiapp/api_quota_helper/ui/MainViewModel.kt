package com.apiapp.api_quota_helper.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.apiapp.api_quota_helper.data.model.Account
import com.apiapp.api_quota_helper.data.model.AccountType
import com.apiapp.api_quota_helper.data.model.AccountWithQuota
import com.apiapp.api_quota_helper.data.repository.AccountRepository
import com.apiapp.api_quota_helper.data.service.QuotaService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class MainUiState(
    val accounts: List<AccountWithQuota> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val showAddDialog: Boolean = false,
    val editingAccount: Account? = null
)

class MainViewModel(
    private val repository: AccountRepository,
    private val quotaService: QuotaService
) : ViewModel() {

    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    init {
        loadAccounts()
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

    fun refreshAllQuotas() {
        viewModelScope.launch {
            _uiState.update { it.copy(isRefreshing = true) }
            val currentAccounts = _uiState.value.accounts
            val updated = currentAccounts.map { awq ->
                if (awq.quota == null && awq.error == null) {
                    val result = quotaService.queryQuota(awq.account)
                    awq.copy(
                        quota = result.getOrNull(),
                        error = result.exceptionOrNull()?.message
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

    fun showEditDialog(account: Account) {
        _uiState.update { it.copy(showAddDialog = true, editingAccount = account) }
    }

    fun dismissDialog() {
        _uiState.update { it.copy(showAddDialog = false, editingAccount = null) }
    }

    fun saveAccount(type: AccountType, name: String, apiKey: String) {
        viewModelScope.launch {
            val existingAccount = _uiState.value.editingAccount
            val account = Account(
                id = existingAccount?.id ?: quotaService.generateAccountId(),
                type = type,
                name = name,
                apiKey = apiKey,
                createdAt = existingAccount?.createdAt ?: System.currentTimeMillis()
            )
            repository.saveAccount(account)
            dismissDialog()
            // 刷新该账户的额度
            refreshAccount(account)
        }
    }

    private fun refreshAccount(account: Account) {
        viewModelScope.launch {
            val result = quotaService.queryQuota(account)
            val currentAccounts = _uiState.value.accounts
            val updated = currentAccounts.map { awq ->
                if (awq.account.id == account.id) {
                    awq.copy(
                        quota = result.getOrNull(),
                        error = result.exceptionOrNull()?.message
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

    fun refreshAccountManually(account: Account) {
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

    override fun onCleared() {
        super.onCleared()
        quotaService.close()
    }
}
