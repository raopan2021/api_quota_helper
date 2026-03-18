package com.apiapp.api_quota_helper.data.model

import kotlinx.serialization.Serializable

/**
 * API 账户类型
 */
@Serializable
enum class AccountType(val displayName: String, val quotaUrl: String) {
    OPENAI("OpenAI", "https://api.openai.com/v1/usage"),
    CLAUDE("Claude", "https://api.anthropic.com/v1/messages"),
    GOOGLE("Google AI", "https://generativelanguage.googleapis.com/v1beta2/models"),
    MOONSHOT("Moonshot", "https://api.moonshot.cn/v1/usage"),
    DEEPSEEK("DeepSeek", "https://api.deepseek.com/v1/usage"),
    XAI("xAI", "https://api.x.ai/v1/usage");

    companion object {
        fun fromName(name: String): AccountType? = entries.find { it.name == name }
    }
}

/**
 * API 账户
 */
@Serializable
data class Account(
    val id: String,
    val type: AccountType,
    val name: String,
    val apiKey: String,
    val createdAt: Long = System.currentTimeMillis()
)

/**
 * 额度信息
 */
@Serializable
data class QuotaInfo(
    val accountId: String,
    val type: AccountType,
    val used: Long,
    val limit: Long,
    val unit: String = "tokens",
    val lastUpdated: Long = System.currentTimeMillis()
) {
    val percentage: Float
        get() = if (limit > 0) (used.toFloat() / limit.toFloat()) else 0f
}

/**
 * 账户列表（带额度信息）
 */
@Serializable
data class AccountWithQuota(
    val account: Account,
    val quota: QuotaInfo? = null,
    val error: String? = null
)
