package com.apiapp.api_quota_helper.ui

import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import com.apiapp.api_quota_helper.R

/**
 * 自定义图标提供者，替代 material-icons-extended
 * 所有图标均为独立的 vector drawable，体积极小 (~20KB total)
 * 使用 painterResource，每次调用时加载
 */
object Icons2 {
    val Refresh: Painter get() = painterResource(R.drawable.ic_refresh)
    val OpenInNew: Painter get() = painterResource(R.drawable.ic_open_in_new)
    val Error: Painter get() = painterResource(R.drawable.ic_error)
    val Delete: Painter get() = painterResource(R.drawable.ic_delete)
    val ArrowBack: Painter get() = painterResource(R.drawable.ic_arrow_back)
    val Warning: Painter get() = painterResource(R.drawable.ic_warning)
    val Upload: Painter get() = painterResource(R.drawable.ic_upload)
    val TouchApp: Painter get() = painterResource(R.drawable.ic_touch_app)
    val Terminal: Painter get() = painterResource(R.drawable.ic_terminal)
    val Settings: Painter get() = painterResource(R.drawable.ic_settings)
    val Search: Painter get() = painterResource(R.drawable.ic_search)
    val Person: Painter get() = painterResource(R.drawable.ic_person)
    val LightMode: Painter get() = painterResource(R.drawable.ic_light_mode)
    val Edit: Painter get() = painterResource(R.drawable.ic_edit)
    val DeleteSweep: Painter get() = painterResource(R.drawable.ic_delete_sweep)
    val DarkMode: Painter get() = painterResource(R.drawable.ic_dark_mode)
    val ContentCopy: Painter get() = painterResource(R.drawable.ic_content_copy)
    val Code: Painter get() = painterResource(R.drawable.ic_code)
    val Cloud: Painter get() = painterResource(R.drawable.ic_cloud)
    val CheckCircle: Painter get() = painterResource(R.drawable.ic_check_circle)
    val Add: Painter get() = painterResource(R.drawable.ic_add)
    val AccountCircle: Painter get() = painterResource(R.drawable.ic_account_circle)
}
