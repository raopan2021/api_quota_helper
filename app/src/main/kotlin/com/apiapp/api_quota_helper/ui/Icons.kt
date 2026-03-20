package com.apiapp.api_quota_helper.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import com.apiapp.api_quota_helper.R

/**
 * 自定义图标提供者
 * 所有图标均为独立的 vector drawable，体积极小 (~20KB total)
 * 替代 material-icons-extended 以减小应用体积
 */
object Icons2 {
    @Composable fun Refresh(): Painter = painterResource(R.drawable.ic_refresh)       // 刷新
    @Composable fun OpenInNew(): Painter = painterResource(R.drawable.ic_open_in_new) // 新窗口打开
    @Composable fun Error(): Painter = painterResource(R.drawable.ic_error)         // 错误
    @Composable fun Delete(): Painter = painterResource(R.drawable.ic_delete)       // 删除
    @Composable fun ArrowBack(): Painter = painterResource(R.drawable.ic_arrow_back) // 返回
    @Composable fun Warning(): Painter = painterResource(R.drawable.ic_warning)     // 警告
    @Composable fun Upload(): Painter = painterResource(R.drawable.ic_upload)       // 上传/请求
    @Composable fun TouchApp(): Painter = painterResource(R.drawable.ic_touch_app) // 触摸提示
    @Composable fun Terminal(): Painter = painterResource(R.drawable.ic_terminal)  // 终端
    @Composable fun Settings(): Painter = painterResource(R.drawable.ic_settings)  // 设置
    @Composable fun Search(): Painter = painterResource(R.drawable.ic_search)      // 搜索
    @Composable fun Person(): Painter = painterResource(R.drawable.ic_person)       // 用户
    @Composable fun LightMode(): Painter = painterResource(R.drawable.ic_light_mode) // 浅色模式
    @Composable fun Edit(): Painter = painterResource(R.drawable.ic_edit)           // 编辑
    @Composable fun DeleteSweep(): Painter = painterResource(R.drawable.ic_delete_sweep) // 批量删除
    @Composable fun DarkMode(): Painter = painterResource(R.drawable.ic_dark_mode)  // 深色模式
    @Composable fun ContentCopy(): Painter = painterResource(R.drawable.ic_content_copy) // 复制
    @Composable fun Code(): Painter = painterResource(R.drawable.ic_code)            // 代码/响应
    @Composable fun Cloud(): Painter = painterResource(R.drawable.ic_cloud)          // 云/空状态
    @Composable fun CheckCircle(): Painter = painterResource(R.drawable.ic_check_circle) // 成功
    @Composable fun Add(): Painter = painterResource(R.drawable.ic_add)              // 添加
    @Composable fun AccountCircle(): Painter = painterResource(R.drawable.ic_account_circle) // 账户头像
}
