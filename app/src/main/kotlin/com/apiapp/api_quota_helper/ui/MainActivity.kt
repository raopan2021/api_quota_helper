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

/**
 * 主活动
 * 应用入口，负责初始化和页面导航
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 启用沉浸式边缘显示
        enableEdgeToEdge()

        setContent {
            val context = LocalContext.current
            // 创建数据仓库（跨页面共享）
            val repository = remember { AccountRepository(context.applicationContext) }
            val quotaService = remember { QuotaService() }
            // 创建 ViewModel
            val viewModel: MainViewModel = viewModel {
                MainViewModel(repository, quotaService)
            }

            // 收集 UI 状态
            val uiState by viewModel.uiState.collectAsState()

            // 应用主题（支持深色模式）
            ApiQuotaHelperTheme(darkTheme = uiState.settings.darkMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // 当前页面状态：main（主页面）/ settings（设置页）/ logs（日志页）
                    var currentScreen by remember { mutableStateOf("main") }

                    // 处理返回键
                    val activity = this
                    BackHandler {
                        when (currentScreen) {
                            "main" -> {
                                // 主页面按返回键：最小化应用
                                @Suppress("DEPRECATION")
                                activity.moveTaskToBack(true)
                            }
                            "settings" -> currentScreen = "main"
                            "logs" -> currentScreen = "settings"
                        }
                    }

                    // 跟踪前一个页面，用于判断是否从设置页返回
                    var previousScreen by remember { mutableStateOf("main") }

                    // 页面切换动画配置
                    AnimatedContent(
                        targetState = currentScreen,
                        transitionSpec = {
                            val duration = 400
                            // Material Design fastOutSlowIn 曲线
                            val easing = CubicBezierEasing(0.4f, 0f, 0.2f, 1f)

                            when (targetState) {
                                "main" -> {
                                    // 从左侧滑入 + 缩放
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
                                    // 从右侧滑入 + 缩放
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
                                    // 从右侧滑入 + 淡入淡出
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
                        // 从设置页返回首页时，刷新额度
                        LaunchedEffect(screen, previousScreen) {
                            if (screen == "main" && previousScreen == "settings") {
                                viewModel.refreshAllQuotas(force = true)
                            }
                            previousScreen = screen
                        }

                        // 根据当前页面显示对应内容
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

/**
 * 返回键处理组件
 * 封装了 Compose 的 BackHandler 并提供更简洁的 API
 */
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
