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
import java.text.SimpleDateFormat
import java.util.*
import java.util.concurrent.ConcurrentLinkedQueue

object LogBuffer {
    private val logs = ConcurrentLinkedQueue<String>()
    private val maxSize = 100
    
    fun add(tag: String, message: String) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        val log = "[$time] $tag: $message"
        logs.offer(log)
        while (logs.size > maxSize) {
            logs.poll()
        }
    }
    
    fun d(tag: String, message: String) = add(tag, message)
    fun e(tag: String, message: String) = add(tag, "ERROR: $message")
    
    fun getAll(): String = logs.joinToString("\n")
    
    fun clear() = logs.clear()
}

class QuotaService() {

    private val TAG = "QuotaService"

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> = withContext(Dispatchers.IO) {
        try {
            val url = URL("http://v2api.aicodee.com/chaxun/query")
            LogBuffer.d(TAG, "请求URL: http://v2api.aicodee.com/chaxun/query")
            LogBuffer.d(TAG, "请求参数: username=${account.username}")
            
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
            
            LogBuffer.d(TAG, "请求体: $jsonBody")

            OutputStreamWriter(connection.outputStream, "UTF-8").use { writer ->
                writer.write(jsonBody)
                writer.flush()
            }

            // 读取响应
            val responseCode = connection.responseCode
            LogBuffer.d(TAG, "响应码: $responseCode")
            LogBuffer.d(TAG, "响应消息: ${connection.responseMessage}")
            
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
            LogBuffer.d(TAG, "响应体: $body")

            if (responseCode != HttpURLConnection.HTTP_OK) {
                val error = "请求失败: HTTP $responseCode, 响应: $body"
                LogBuffer.e(TAG, error)
                return@withContext Result.failure(Exception(error))
            }

            if (body.isEmpty()) {
                LogBuffer.e(TAG, "空响应")
                return@withContext Result.failure(Exception("空响应"))
            }

            val jsonObject = JSONObject(body)
            val success = jsonObject.optBoolean("success", false)

            if (!success) {
                val message = jsonObject.optString("message", "查询失败")
                LogBuffer.e(TAG, message)
                return@withContext Result.failure(Exception(message))
            }

            val data = jsonObject.optJSONObject("data")
                ?: run {
                    LogBuffer.e(TAG, "数据为空")
                    return@withContext Result.failure(Exception("数据为空"))
                }

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

            LogBuffer.d(TAG, "解析成功: plan=${quotaData.plan_name}, used=${quotaData.amount_used}/${quotaData.amount}")
            Result.success(quotaData)
        } catch (e: Exception) {
            LogBuffer.e(TAG, "${e.message}")
            Result.failure(e)
        }
    }

    fun generateAccountId(): String = java.util.UUID.randomUUID().toString()
}
