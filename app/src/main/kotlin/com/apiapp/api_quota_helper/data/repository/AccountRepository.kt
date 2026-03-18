package com.apiapp.api_quota_helper.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.apiapp.api_quota_helper.data.model.Account
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "accounts")

class AccountRepository(private val context: Context) {

    private val json = Json { ignoreUnknownKeys = true }
    private val accountsKey = stringPreferencesKey("accounts")

    val accounts: Flow<List<Account>> = context.dataStore.data.map { prefs ->
        val accountsJson = prefs[accountsKey] ?: "[]"
        try {
            json.decodeFromString<List<Account>>(accountsJson)
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun saveAccount(account: Account) {
        context.dataStore.edit { prefs ->
            val current = try {
                json.decodeFromString<List<Account>>(prefs[accountsKey] ?: "[]").toMutableList()
            } catch (e: Exception) {
                mutableListOf()
            }

            val existing = current.indexOfFirst { it.id == account.id }
            if (existing >= 0) {
                current[existing] = account
            } else {
                current.add(account)
            }

            prefs[accountsKey] = json.encodeToString(current)
        }
    }

    suspend fun deleteAccount(accountId: String) {
        context.dataStore.edit { prefs ->
            val current = try {
                json.decodeFromString<List<Account>>(prefs[accountsKey] ?: "[]").toMutableList()
            } catch (e: Exception) {
                mutableListOf()
            }
            current.removeAll { it.id == accountId }
            prefs[accountsKey] = json.encodeToString(current)
        }
    }
}
