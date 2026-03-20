package com.apiapp.api_quota_helper.data.model

import kotlinx.serialization.Serializable

/**
 * 用户账户（用于额度查询）
 */
@Serializable
data class UserAccount(
    val id: String,
    val username: String,
    val token: String,
    val createdAt: Long = System.currentTimeMillis()
)

/**
 * 额度查询结果
 */
@Serializable
data class QuotaResponse(
    val success: Boolean,
    val data: QuotaData? = null,
    val message: String? = null
)

@Serializable
data class QuotaData(
    val subscription_id: Int = 0,
    val plan_name: String = "",
    val days_remaining: Int = 0,
    val end_time: String = "",
    val amount: Double = 0.0,
    val amount_used: Double = 0.0,
    val next_reset_time: String = "",
    val status: String = ""
) {
    val remaining: Double
        get() = amount - amount_used
    
    val usedPercentage: Float
        get() = if (amount > 0) (amount_used / amount).toFloat() else 0f
}

/**
 * 账户列表（带额度信息）
 */
@Serializable
data class AccountWithQuota(
    val account: UserAccount,
    val quota: QuotaData? = null,
    val error: String? = null,
    val lastUpdated: Long = 0L
)

/**
 * 应用设置
 */
@Serializable
data class AppSettings(
    val darkMode: Boolean = false,
    val refreshIntervalSeconds: Int = 60  // 默认 0h 1min 0s
)
