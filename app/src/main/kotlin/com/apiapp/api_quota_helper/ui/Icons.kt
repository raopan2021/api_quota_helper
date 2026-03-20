package com.apiapp.api_quota_helper.ui

import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import com.apiapp.api_quota_helper.R

/**
 * 自定义图标提供者，替代 material-icons-extended
 * 所有图标均为独立的 vector drawable，体积极小 (~20KB total)
 */
object Icons2 {
    @Composable fun Refresh(): Painter = painterResource(R.drawable.ic_refresh)
    @Composable fun OpenInNew(): Painter = painterResource(R.drawable.ic_open_in_new)
    @Composable fun Error(): Painter = painterResource(R.drawable.ic_error)
    @Composable fun Delete(): Painter = painterResource(R.drawable.ic_delete)
    @Composable fun ArrowBack(): Painter = painterResource(R.drawable.ic_arrow_back)
    @Composable fun Warning(): Painter = painterResource(R.drawable.ic_warning)
    @Composable fun Upload(): Painter = painterResource(R.drawable.ic_upload)
    @Composable fun TouchApp(): Painter = painterResource(R.drawable.ic_touch_app)
    @Composable fun Terminal(): Painter = painterResource(R.drawable.ic_terminal)
    @Composable fun Settings(): Painter = painterResource(R.drawable.ic_settings)
    @Composable fun Search(): Painter = painterResource(R.drawable.ic_search)
    @Composable fun Person(): Painter = painterResource(R.drawable.ic_person)
    @Composable fun LightMode(): Painter = painterResource(R.drawable.ic_light_mode)
    @Composable fun Edit(): Painter = painterResource(R.drawable.ic_edit)
    @Composable fun DeleteSweep(): Painter = painterResource(R.drawable.ic_delete_sweep)
    @Composable fun DarkMode(): Painter = painterResource(R.drawable.ic_dark_mode)
    @Composable fun ContentCopy(): Painter = painterResource(R.drawable.ic_content_copy)
    @Composable fun Code(): Painter = painterResource(R.drawable.ic_code)
    @Composable fun Cloud(): Painter = painterResource(R.drawable.ic_cloud)
    @Composable fun CheckCircle(): Painter = painterResource(R.drawable.ic_check_circle)
    @Composable fun Add(): Painter = painterResource(R.drawable.ic_add)
    @Composable fun AccountCircle(): Painter = painterResource(R.drawable.ic_account_circle)
}
