package com.apiapp.api_quota_helper.data.service

import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.UserAccount
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.UUID

class QuotaService() {

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> = withContext(Dispatchers.IO) {
        try {
            val url = URL("http://v2api.aicodee.com/chaxun/query")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "POST"
            connection.doOutput = true
            connection.doInput = true
            connection.connectTimeout = 15000
            connection.readTimeout = 30000
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")

            // 发送请求体
            val jsonBody = JSONObject().apply {
                put("username", account.username)
                put("token", account.token)
            }.toString()

            OutputStreamWriter(connection.outputStream, "UTF-8").use { writer ->
                writer.write(jsonBody)
                writer.flush()
            }

            // 读取响应
            val responseCode = connection.responseCode
            val reader = BufferedReader(InputStreamReader(
                if (responseCode == HttpURLConnection.HTTP_OK) 
                    connection.inputStream 
                else 
                    connection.errorStream,
                "UTF-8"
            ))

            val response = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                response.append(line)
            }
            reader.close()

            if (responseCode != HttpURLConnection.HTTP_OK) {
                return@withContext Result.failure(Exception("请求失败: HTTP $responseCode"))
            }

            val body = response.toString()
            if (body.isEmpty()) {
                return@withContext Result.failure(Exception("空响应"))
            }

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
}
