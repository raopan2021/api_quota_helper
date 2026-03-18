package com.apiapp.api_quota_helper.data.service

import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.UserAccount
import io.ktor.client.*
import io.ktor.client.engine.okhttp.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.client.statement.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.*
import java.util.UUID

class QuotaService() {

    private val httpClient = HttpClient(OkHttp) {
        install(HttpTimeout) {
            requestTimeoutMillis = 30000
            connectTimeoutMillis = 15000
        }
    }

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> {
        return try {
            val requestBody = """{"username":"${account.username}","token":"${account.token}"}"""
            
            val response = httpClient.post("http://v2api.aicodee.com/chaxun/query") {
                contentType(ContentType.Application.Json)
                setBody(requestBody)
            }
            
            val body = response.bodyAsText()
            
            val jsonElement = Json.parseToJsonElement(body)
            val jsonObject = jsonElement.jsonObject
            val success = jsonObject["success"]?.jsonPrimitive?.content?.toBoolean() ?: false
            
            if (success) {
                val data = jsonObject["data"]?.jsonObject
                if (data != null) {
                    val quotaData = QuotaData(
                        subscription_id = data["subscription_id"]?.jsonPrimitive?.content?.toIntOrNull() ?: 0,
                        plan_name = data["plan_name"]?.jsonPrimitive?.content ?: "",
                        days_remaining = data["days_remaining"]?.jsonPrimitive?.content?.toIntOrNull() ?: 0,
                        end_time = data["end_time"]?.jsonPrimitive?.content ?: "",
                        amount = data["amount"]?.jsonPrimitive?.content?.toDoubleOrNull() ?: 0.0,
                        amount_used = data["amount_used"]?.jsonPrimitive?.content?.toDoubleOrNull() ?: 0.0,
                        next_reset_time = data["next_reset_time"]?.jsonPrimitive?.content ?: "",
                        status = data["status"]?.jsonPrimitive?.content ?: ""
                    )
                    Result.success(quotaData)
                } else {
                    Result.failure(Exception("数据为空"))
                }
            } else {
                val message = jsonObject["message"]?.jsonPrimitive?.content ?: "查询失败"
                Result.failure(Exception(message))
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
