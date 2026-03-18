package com.apiapp.api_quota_helper.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.apiapp.api_quota_helper.data.repository.AccountRepository
import com.apiapp.api_quota_helper.data.service.QuotaService
import com.apiapp.api_quota_helper.ui.theme.ApiQuotaHelperTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val context = LocalContext.current
            val repository = remember { AccountRepository(context.applicationContext) }
            val quotaService = remember { QuotaService() }
            val viewModel: MainViewModel = viewModel {
                MainViewModel(repository, quotaService)
            }
            
            val uiState by viewModel.uiState.collectAsState()
            
            ApiQuotaHelperTheme(darkTheme = uiState.settings.darkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var currentScreen by remember { mutableStateOf("main") }
                    
                    when (currentScreen) {
                        "main" -> {
                            MainScreen(
                                viewModel = viewModel,
                                onNavigateToSettings = { currentScreen = "settings" }
                            )
                        }
                        "settings" -> {
                            SettingsScreen(
                                settings = uiState.settings,
                                onDarkModeChange = { viewModel.updateDarkMode(it) },
                                onRefreshIntervalChange = { viewModel.updateRefreshInterval(it) },
                                onBack = { currentScreen = "main" },
                                onShowLogs = { currentScreen = "logs" }
                            )
                        }
                        "logs" -> {
                            LogScreen(onBack = { currentScreen = "settings" })
                        }
                    }
                }
            }
        }
    }
}
