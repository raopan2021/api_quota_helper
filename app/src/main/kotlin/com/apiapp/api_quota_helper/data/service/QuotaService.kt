package com.apiapp.api_quota_helper.data.service

import com.apiapp.api_quota_helper.data.model.QuotaData
import com.apiapp.api_quota_helper.data.model.UserAccount
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class QuotaService() {

    private val TAG = "QuotaService"

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> = withContext(Dispatchers.IO) {
        try {
            val url = URL("http://v2api.aicodee.com/chaxun/query")
            Log.d(TAG, "请求URL: http://v2api.aicodee.com/chaxun/query")
            Log.d(TAG, "请求参数: username=${account.username}, token=${account.token}")
            
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
            
            Log.d(TAG, "请求体: $jsonBody")

            OutputStreamWriter(connection.outputStream, "UTF-8").use { writer ->
                writer.write(jsonBody)
                writer.flush()
            }

            // 读取响应
            val responseCode = connection.responseCode
            Log.d(TAG, "响应码: $responseCode")
            
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

            val body = response.toString()
            Log.d(TAG, "响应体: $body")

            if (responseCode != HttpURLConnection.HTTP_OK) {
                return@withContext Result.failure(Exception("请求失败: HTTP $responseCode, 响应: $body"))
            }

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

            Log.d(TAG, "解析成功: $quotaData")
            Result.success(quotaData)
        } catch (e: Exception) {
            Log.e(TAG, "请求异常: ${e.message}", e)
            Result.failure(e)
        }
    }

    fun generateAccountId(): String = UUID.randomUUID().toString()
}
