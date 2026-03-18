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
    private val logs = ConcurrentLinkedQueue<LogEntry>()
    private const val maxSize = 50
    
    data class LogEntry(
        val id: Long = System.currentTimeMillis(),
        val time: String,
        val success: Boolean,
        val username: String,
        val responseCode: Int,
        val responseMessage: String,
        val responseBody: String,
        val errorMessage: String? = null
    )
    
    fun add(entry: LogEntry) {
        logs.offer(entry)
        while (logs.size > maxSize) {
            logs.poll()
        }
    }
    
    fun logRequest(username: String) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        add(LogEntry(
            time = time,
            success = false,
            username = username,
            responseCode = 0,
            responseMessage = "请求中...",
            responseBody = ""
        ))
    }
    
    fun logResponse(username: String, success: Boolean, responseCode: Int, responseMessage: String, responseBody: String, errorMessage: String? = null) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        add(LogEntry(
            time = time,
            success = success,
            username = username,
            responseCode = responseCode,
            responseMessage = responseMessage,
            responseBody = responseBody,
            errorMessage = errorMessage
        ))
    }
    
    fun getAll(): List<LogEntry> = logs.toList().reversed()
    
    fun delete(id: Long) {
        logs.removeAll { it.id == id }
    }
    
    fun clear() = logs.clear()
    
    fun getAsString(entry: LogEntry): String = if (entry.success) {
        "[${entry.time}] ✅ ${entry.username}\n状态码: ${entry.responseCode} ${entry.responseMessage}\n响应:\n${formatJsonForCopy(entry.responseBody)}"
    } else {
        "[${entry.time}] ❌ ${entry.username}\n状态码: ${entry.responseCode} ${entry.responseMessage}\n错误: ${entry.errorMessage ?: entry.responseBody}"
    }
    
    fun getAllAsString(): String = getAll().joinToString("\n---\n") { getAsString(it) }
    
    private fun formatJsonForCopy(jsonString: String): String {
        return try {
            JSONObject(jsonString).toString(2)
        } catch (e: Exception) {
            jsonString
        }
    }
}

class QuotaService() {

    private val TAG = "QuotaService"

    suspend fun queryQuota(account: UserAccount): Result<QuotaData> = withContext(Dispatchers.IO) {
        var lastException: Exception? = null
        
        // 最多重试3次
        repeat(3) { attempt ->
            try {
                val url = URL("http://v2api.aicodee.com/chaxun/query")
                LogBuffer.logRequest(account.username)
                
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
                val responseMessage = connection.responseMessage
                
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
                
                // 记录响应日志
                if (responseCode != HttpURLConnection.HTTP_OK || body.isEmpty() || !body.contains("\"success\":true")) {
                    val errorMsg = when {
                        responseCode != HttpURLConnection.HTTP_OK -> "HTTP $responseCode"
                        body.isEmpty() -> "空响应"
                        else -> JSONObject(body).optString("message", "查询失败")
                    }
                    LogBuffer.logResponse(account.username, false, responseCode, responseMessage, body, errorMsg)
                    
                    if (attempt < 2) {
                        // 还有重试机会，记录"重试中"
                        lastException = Exception(errorMsg)
                        kotlinx.coroutines.delay(1000) // 1秒后重试
                        return@repeat
                    }
                    
                    return@withContext Result.failure(Exception(errorMsg))
                } else {
                    LogBuffer.logResponse(account.username, true, responseCode, responseMessage, body)
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

                return@withContext Result.success(quotaData)
            } catch (e: Exception) {
                LogBuffer.logResponse(account.username, false, 0, "", "", e.message)
                lastException = e
                
                if (attempt < 2) {
                    kotlinx.coroutines.delay(1000) // 1秒后重试
                }
            }
        }
        
        Result.failure(lastException ?: Exception("请求失败"))
    }

    fun generateAccountId(): String = java.util.UUID.randomUUID().toString()
}
