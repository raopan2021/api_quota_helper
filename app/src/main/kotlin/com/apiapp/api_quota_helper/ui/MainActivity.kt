package com.apiapp.api_quota_helper.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
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
                    var previousScreen by remember { mutableStateOf("main") }
                    
                    // 收集状态变化来确定动画方向
                    LaunchedEffect(currentScreen) {
                        previousScreen = currentScreen
                    }
                    
                    // 处理返回键
                    val activity = this
                    BackHandler {
                        when (currentScreen) {
                            "main" -> {
                                @Suppress("DEPRECATION")
                                activity.moveTaskToBack(true)
                            }
                            "settings" -> currentScreen = "main"
                            "logs" -> currentScreen = "settings"
                        }
                    }
                    
                    AnimatedContent(
                        targetState = currentScreen,
                        transitionSpec = {
                            when (targetState) {
                                "main" -> {
                                    if (initialState != "main") {
                                        slideInHorizontally(
                                            animationSpec = tween(300),
                                            initialOffsetX = { -it }
                                        ) + fadeIn(animationSpec = tween(300)) togetherWith
                                        slideOutHorizontally(
                                            animationSpec = tween(300),
                                            targetOffsetX = { it }
                                        ) + fadeOut(animationSpec = tween(300))
                                    } else {
                                        fadeIn() togetherWith fadeOut()
                                    }
                                }
                                "settings" -> {
                                    slideInHorizontally(
                                        animationSpec = tween(300),
                                        initialOffsetX = { it }
                                    ) + fadeIn(animationSpec = tween(300)) togetherWith
                                    slideOutHorizontally(
                                        animationSpec = tween(300),
                                        targetOffsetX = { -it }
                                    ) + fadeOut(animationSpec = tween(300))
                                }
                                "logs" -> {
                                    slideInHorizontally(
                                        animationSpec = tween(300),
                                        initialOffsetX = { it }
                                    ) + fadeIn(animationSpec = tween(300)) togetherWith
                                    slideOutHorizontally(
                                        animationSpec = tween(300),
                                        targetOffsetX = { -it }
                                    ) + fadeOut(animationSpec = tween(300))
                                }
                                else -> fadeIn() togetherWith fadeOut()
                            }
                        },
                        label = "screen_transition"
                    ) { screen ->
                        when (screen) {
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
}

@Composable
fun BackHandler(onBack: () -> Unit) {
    val activity = androidx.compose.ui.platform.LocalContext.current as? ComponentActivity
    val backDispatcher = activity?.onBackPressedDispatcher
    
    DisposableEffect(Unit) {
        val callback = object : androidx.activity.OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                onBack()
            }
        }
        backDispatcher?.addCallback(callback)
        onDispose { }
    }
}
