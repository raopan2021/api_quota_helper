package com.apiapp.api_quota_helper.data.service

import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.QuotaResponse
import com.apiapp.api_quota_helper.data.model.UserAccount
import io.ktor.client.*
import io.ktor.client.engine.okhttp.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.client.statement.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

@Serializable
data class QuotaRequest(
    val username: String,
    val token: String
)

class QuotaService {

    private val httpClient = HttpClient(OkHttp) {
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
            connectTimeoutMillis = 15000
        }
    }

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> {
        return try {
            val request = QuotaRequest(
                username = account.username,
                token = account.token
            )
            val requestBody = json.encodeToString(request)
            
            val response = httpClient.post("http://v2api.aicodee.com/chaxun/query") {
                contentType(ContentType.Application.Json)
                setBody(requestBody)
            }
            
            val body = response.bodyAsText()
            val quotaResponse = json.decodeFromString<QuotaResponse>(body)
            
            if (quotaResponse.success && quotaResponse.data != null) {
                Result.success(quotaResponse.data)
            } else {
                Result.failure(Exception(quotaResponse.message ?: "查询失败"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun generateAccountId(): String = UUID.randomUUID().toString()

    fun close() {
        httpClient.close()
    }
}
