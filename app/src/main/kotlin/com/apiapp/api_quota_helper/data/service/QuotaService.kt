package com.apiapp.api_quota_helper.data.service

import com.apiapp.api_quota_helper.data.model.Account
import com.apiapp.api_quota_helper.data.model.AccountType
import com.apiapp.api_quota_helper.data.model.QuotaInfo
import io.ktor.client.*
import io.ktor.client.engine.okhttp.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.withTimeout
import java.util.UUID

class QuotaService() {

    private val httpClient = HttpClient(OkHttp) {
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
            connectTimeoutMillis = 15000
        }
        defaultRequest {
            contentType(ContentType.Application.Json)
        }
    }

    suspend fun queryQuota(account: Account): Result<QuotaInfo> {
        return try {
            val quota = when (account.type) {
                AccountType.OPENAI -> queryOpenAI(account)
                AccountType.CLAUDE -> queryClaude(account)
                AccountType.GOOGLE -> queryGoogle(account)
                AccountType.MOONSHOT -> queryMoonshot(account)
                AccountType.DEEPSEEK -> queryDeepSeek(account)
                AccountType.XAI -> queryXAI(account)
            }
            Result.success(quota)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // OpenAI API 额度查询
    private suspend fun queryOpenAI(account: Account): QuotaInfo {
        val response = httpClient.get("https://api.openai.com/v1/usage") {
            header("Authorization", "Bearer ${account.apiKey}")
        }
        val body = response.bodyAsText()
        val used = extractJsonLong(body, "total_usage", "total_tokens")
        return QuotaInfo(
            accountId = account.id,
            type = account.type,
            used = used,
            limit = 0, // OpenAI 按量计费，无固定限额
            unit = "tokens"
        )
    }

    // Claude API 额度查询
    private suspend fun queryClaude(account: Account): QuotaInfo {
        // Claude 需要发送请求才能获取使用量，这里简单返回
        return QuotaInfo(
            accountId = account.id,
            type = account.type,
            used = 0,
            limit = 0,
            unit = "tokens"
        )
    }

    // Google AI 额度查询
    private suspend fun queryGoogle(account: Account): QuotaInfo {
        return QuotaInfo(
            accountId = account.id,
            type = account.type,
            used = 0,
            limit = 0,
            unit = "requests"
        )
    }

    // Moonshot API 额度查询
    private suspend fun queryMoonshot(account: Account): QuotaInfo {
        val response = httpClient.get("https://api.moonshot.cn/v1/usage") {
            header("Authorization", "Bearer ${account.apiKey}")
        }
        val body = response.bodyAsText()
        val used = extractJsonLong(body, "total_tokens")
        return QuotaInfo(
            accountId = account.id,
            type = account.type,
            used = used,
            limit = 0,
            unit = "tokens"
        )
    }

    // DeepSeek API 额度查询
    private suspend fun queryDeepSeek(account: Account): QuotaInfo {
        val response = httpClient.get("https://api.deepseek.com/v1/usage") {
            header("Authorization", "Bearer ${account.apiKey}")
        }
        val body = response.bodyAsText()
        val used = extractJsonLong(body, "total_tokens")
        return QuotaInfo(
            accountId = account.id,
            type = account.type,
            used = used,
            limit = 0,
            unit = "tokens"
        )
    }

    // xAI API 额度查询
    private suspend fun queryXAI(account: Account): QuotaInfo {
        return QuotaInfo(
            accountId = account.id,
            type = account.type,
            used = 0,
            limit = 0,
            unit = "tokens"
        )
    }

    // 简单 JSON 解析，提取长整型值
    private fun extractJsonLong(json: String, vararg keys: String): Long {
        try {
            // 简单匹配 "key":数字 或 "key": 数字
            for (key in keys) {
                val pattern = """"$key"\s*:\s*(\d+)""".toRegex()
                val match = pattern.find(json)
                if (match != null) {
                    return match.groupValues[1].toLong()
                }
            }
        } catch (e: Exception) {
            // 忽略解析错误
        }
        return 0L
    }

    fun generateAccountId(): String = UUID.randomUUID().toString()

    fun close() {
        httpClient.close()
    }
}
