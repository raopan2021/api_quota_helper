package com.apiapp.api_quota_helper.ui

import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.vectorResource
import com.apiapp.api_quota_helper.R

/**
 * 自定义图标提供者，替代 material-icons-extended
 * 所有图标均为独立的 vector drawable，体积极小 (~20KB total)
 */
object Icons2 {
    val Refresh: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_refresh)
    val OpenInNew: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_open_in_new)
    val Error: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_error)
    val Delete: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_delete)
    val ArrowBack: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_arrow_back)
    val Warning: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_warning)
    val Upload: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_upload)
    val TouchApp: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_touch_app)
    val Terminal: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_terminal)
    val Settings: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_settings)
    val Search: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_search)
    val Person: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_person)
    val LightMode: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_light_mode)
    val Edit: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_edit)
    val DeleteSweep: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_delete_sweep)
    val DarkMode: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_dark_mode)
    val ContentCopy: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_content_copy)
    val Code: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_code)
    val Cloud: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_cloud)
    val CheckCircle: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_check_circle)
    val Add: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_add)
    val AccountCircle: ImageVector get() = ImageVector.vectorResource(R.drawable.ic_account_circle)
}
