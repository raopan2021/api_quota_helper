package com.apiapp.api_quota_helper.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.*
import androidx.compose.animation.core.*
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
                    
                    // 跟踪前一个页面，用于判断是否从设置页返回
                    var previousScreen by remember { mutableStateOf("main") }

                    // 页面切换动画
                    AnimatedContent(
                        targetState = currentScreen,
                        transitionSpec = {
                            val duration = 400
                            val easing = CubicBezierEasing(0.4f, 0f, 0.2f, 1f) // fastOutSlowIn approximation

                            when (targetState) {
                                "main" -> {
                                    // 从左边滑入 + 缩放
                                    (slideInHorizontally(
                                        animationSpec = tween(duration, easing = easing),
                                        initialOffsetX = { -it }
                                    ) + fadeIn(
                                        animationSpec = tween(duration, easing = easing)
                                    ) + scaleIn(
                                        animationSpec = tween(duration, easing = easing),
                                        initialScale = 0.92f
                                    )).togetherWith(
                                        slideOutHorizontally(
                                            animationSpec = tween(duration, easing = easing),
                                            targetOffsetX = { it }
                                        ) + fadeOut(
                                            animationSpec = tween(duration, easing = easing)
                                        ) + scaleOut(
                                            animationSpec = tween(duration, easing = easing),
                                            targetScale = 1.08f
                                        )
                                    )
                                }
                                "settings" -> {
                                    // 从右边滑入 + 缩放
                                    (slideInHorizontally(
                                        animationSpec = tween(duration, easing = easing),
                                        initialOffsetX = { it }
                                    ) + fadeIn(
                                        animationSpec = tween(duration, easing = easing)
                                    ) + scaleIn(
                                        animationSpec = tween(duration, easing = easing),
                                        initialScale = 0.88f
                                    )).togetherWith(
                                        slideOutHorizontally(
                                            animationSpec = tween(duration, easing = easing),
                                            targetOffsetX = { -it / 3 }
                                        ) + fadeOut(
                                            animationSpec = tween(duration, easing = easing)
                                        ) + scaleOut(
                                            animationSpec = tween(duration, easing = easing),
                                            targetScale = 0.95f
                                        )
                                    )
                                }
                                "logs" -> {
                                    // 从右边滑入 + 淡入淡出
                                    (slideInHorizontally(
                                        animationSpec = tween(duration, easing = easing),
                                        initialOffsetX = { it }
                                    ) + fadeIn(
                                        animationSpec = tween(duration, easing = easing)
                                    ) + scaleIn(
                                        animationSpec = tween(duration, easing = easing),
                                        initialScale = 0.9f
                                    )).togetherWith(
                                        slideOutHorizontally(
                                            animationSpec = tween(duration, easing = easing),
                                            targetOffsetX = { -it / 3 }
                                        ) + fadeOut(
                                            animationSpec = tween(duration, easing = easing)
                                        ) + scaleOut(
                                            animationSpec = tween(duration, easing = easing),
                                            targetScale = 0.95f
                                        )
                                    )
                                }
                                else -> fadeIn() togetherWith fadeOut()
                            }
                        },
                        modifier = Modifier.fillMaxSize(),
                        label = "screen_transition"
                    ) { screen ->
                        // 当从设置页返回首页时，刷新额度
                        LaunchedEffect(screen, previousScreen) {
                            if (screen == "main" && previousScreen == "settings") {
                                viewModel.refreshAllQuotas(force = true)
                            }
                            previousScreen = screen
                        }

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
