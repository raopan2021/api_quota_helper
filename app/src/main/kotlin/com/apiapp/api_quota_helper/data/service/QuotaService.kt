package com.apiapp.api_quota_helper.data.service

import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.UserAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.UUID
import java.io.IOException

class QuotaService() {

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, java.util.concurrent.TimeUnit.SECONDS)
        .readTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .writeTimeout(30, java.util.concurrent.TimeUnit.SECONDS)
        .protocols(listOf(Protocol.HTTP_1_1))
        .build()

    private val JSON_MEDIA_TYPE = "application/json".toMediaType()

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> = withContext(Dispatchers.IO) {
        try {
            val jsonBody = JSONObject().apply {
                put("username", account.username)
                put("token", account.token)
            }.toString()

            val request = Request.Builder()
                .url("http://v2api.aicodee.com/chaxun/query")
                .post(jsonBody.toRequestBody(JSON_MEDIA_TYPE))
                .header("Accept", "application/json")
                .header("Content-Type", "application/json")
                .build()

            val response = httpClient.newCall(request).execute()
            val body = response.body?.string() ?: throw IOException("空响应")

            val jsonObject = JSONObject(body)
            val success = jsonObject.optBoolean("success", false)

            if (!success) {
                val message = jsonObject.optString("message", "查询失败")
                return@withContext Result.failure(Exception(message))
            }

            val data = jsonObject.optJSONObject("data")
                ?: return@withContext Result.failure(Exception("数据为空"))

            val quotaData = QuotaData(
                subscription_id = data.optInt("subscription_id", 0),
                plan_name = data.optString("plan_name", ""),
                days_remaining = data.optInt("days_remaining", 0),
                end_time = data.optString("end_time", ""),
                amount = data.optDouble("amount", 0.0),
                amount_used = data.optDouble("amount_used", 0.0),
                next_reset_time = data.optString("next_reset_time", ""),
                status = data.optString("status", "")
            )

            Result.success(quotaData)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun generateAccountId(): String = UUID.randomUUID().toString()

    fun close() {
        httpClient.dispatcher.executorService.shutdown()
    }
}
