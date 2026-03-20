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

/**
 * 日志缓冲区
 * 存储最近的日志条目，用于在日志页面展示
 * 最多存储50条，超出后自动删除最旧的
 */
object LogBuffer {
    /** 日志队列 */
    private val logs = ConcurrentLinkedQueue<LogEntry>()
    /** 最大日志数量 */
    private const val maxSize = 50

    /**
     * 日志条目
     * @param id 唯一ID（时间戳）
     * @param time 格式化的时间字符串（HH:mm:ss）
     * @param success 是否成功
     * @param logType 日志类型（如"额度查询"、"账户识别"）
     * @param username 关联的用户名
     * @param requestBody 请求体（JSON字符串）
     * @param responseCode HTTP响应码
     * @param responseMessage HTTP响应消息
     * @param responseBody 响应体（JSON字符串）
     * @param errorMessage 错误信息（如果有）
     */
    data class LogEntry(
        val id: Long = System.currentTimeMillis(),
        val time: String,
        val success: Boolean,
        val logType: String,
        val username: String,
        val requestBody: String,
        val responseCode: Int,
        val responseMessage: String,
        val responseBody: String,
        val errorMessage: String? = null
    )

    /**
     * 添加日志条目
     * 超出最大数量时自动删除最旧的
     */
    fun add(entry: LogEntry) {
        logs.offer(entry)
        while (logs.size > maxSize) {
            logs.poll()
        }
    }

    /**
     * 记录请求开始（用于显示"请求中..."状态）
     */
    fun logRequest(logType: String, username: String, requestBody: String) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        add(LogEntry(
            time = time,
            success = false,
            logType = logType,
            username = username,
            requestBody = requestBody,
            responseCode = 0,
            responseMessage = "请求中...",
            responseBody = ""
        ))
    }

    /**
     * 记录请求响应
     */
    fun logResponse(
        logType: String,
        username: String,
        requestBody: String,
        success: Boolean,
        responseCode: Int,
        responseMessage: String,
        responseBody: String,
        errorMessage: String? = null
    ) {
        val time = SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())
        add(LogEntry(
            time = time,
            success = success,
            logType = logType,
            username = username,
            requestBody = requestBody,
            responseCode = responseCode,
            responseMessage = responseMessage,
            responseBody = responseBody,
            errorMessage = errorMessage
        ))
    }

    /** 获取所有日志（按时间倒序） */
    fun getAll(): List<LogEntry> = logs.toList().reversed()

    /** 删除指定ID的日志 */
    fun delete(id: Long) {
        logs.removeAll { it.id == id }
    }

    /** 清空所有日志 */
    fun clear() = logs.clear()

    /** 清空指定类型的日志 */
    fun clearByType(logType: String) {
        logs.removeAll { it.logType == logType }
    }

    /**
     * 将单条日志格式化为可读字符串（用于复制到剪贴板）
     */
    fun getAsString(entry: LogEntry): String = if (entry.success) {
        "[${entry.time}] [${entry.logType}] ✅ ${entry.username}\n请求:\n${entry.requestBody}\n响应:\n${formatJsonForCopy(entry.responseBody)}"
    } else {
        "[${entry.time}] [${entry.logType}] ❌ ${entry.username}\n请求:\n${entry.requestBody}\n错误: ${entry.errorMessage ?: entry.responseBody}"
    }

    /** 将所有日志合并为一个字符串 */
    fun getAllAsString(): String = getAll().joinToString("\n---\n") { getAsString(it) }

    /** 格式化JSON用于复制（2空格缩进） */
    private fun formatJsonForCopy(jsonString: String): String {
        return try {
            JSONObject(jsonString).toString(2)
        } catch (e: Exception) {
            jsonString
        }
    }
}

/**
 * 额度查询服务
 * 负责与API服务器通信，查询账户额度
 * 包含重试机制（最多3次）
 */
class QuotaService() {
    private val TAG = "QuotaService"

    /**
     * 查询账户额度
     * @param account 要查询的账户
     * @return Result<QuotaData> 查询结果
     * @implNote 最多重试3次，每次失败后等待1秒再重试
     */
    suspend fun queryQuota(account: UserAccount): Result<QuotaData> = withContext(Dispatchers.IO) {
        var lastException: Exception? = null

        // 最多重试3次
        repeat(3) { attempt ->
            // 请求体在循环内创建以便在catch中访问
            val jsonBody = JSONObject().apply {
                put("username", account.username)
                put("token", account.token)
            }.toString()

            try {
                val url = URL("http://v2api.aicodee.com/chaxun/query")

                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true
                connection.doInput = true
                connection.connectTimeout = 15000  // 15秒连接超时
                connection.readTimeout = 30000      // 30秒读取超时
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Accept", "application/json")

                // 发送请求
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
                    LogBuffer.logResponse("额度查询", account.username, jsonBody, false, responseCode, responseMessage, body, errorMsg)

                    if (attempt < 2) {
                        // 还有重试机会，记录"重试中"
                        lastException = Exception(errorMsg)
                        kotlinx.coroutines.delay(1000) // 1秒后重试
                        return@repeat
                    }

                    return@withContext Result.failure(Exception(errorMsg))
                } else {
                    LogBuffer.logResponse("额度查询", account.username, jsonBody, true, responseCode, responseMessage, body)
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

                // 解析额度数据
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
                // 记录异常日志
                LogBuffer.logResponse("额度查询", account.username, jsonBody, false, 0, "", "", e.message)
                lastException = e

                if (attempt < 2) {
                    kotlinx.coroutines.delay(1000) // 1秒后重试
                }
            }
        }

        Result.failure(lastException ?: Exception("请求失败"))
    }

    /** 生成唯一的账户ID（UUID） */
    fun generateAccountId(): String = java.util.UUID.randomUUID().toString()
}
