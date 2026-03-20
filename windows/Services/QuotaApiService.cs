using System.Text;
using System.Text.Json;
using ApiQuotaHelper.Models;

namespace ApiQuotaHelper.Services;

public class QuotaApiService
{
    private readonly AccountService _accountService;
    private readonly LogService _logService;

    public QuotaApiService(AccountService accountService, LogService logService)
    {
        _accountService = accountService;
        _logService = logService;
    }

    public async Task<QuotaData?> QueryQuotaAsync(Account account)
    {
        var jsonBody = JsonSerializer.Serialize(new { username = account.Username, token = account.Token });
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(30) };
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://untitled-node-6gyb.onrender.com/api/quota")
            {
                Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
            };
            request.Headers.Add("Accept", "application/json");

            var response = await client.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            var code = (int)response.StatusCode;
            var msg = response.ReasonPhrase ?? "";

            if (code != 200 || !body.Contains("\"success\":true"))
            {
                var errMsg = code != 200 ? $"HTTP {code}" : string.IsNullOrEmpty(body) ? "空响应" : TryGetMsg(body);
                _logService.LogResponse("额度查询", account.Username, jsonBody, false, code, msg, body, errMsg);
                return null;
            }

            _logService.LogResponse("额度查询", account.Username, jsonBody, true, code, msg, body);
            return Parse(body);
        }
        catch (Exception e)
        {
            _logService.LogResponse("额度查询", account.Username, jsonBody, false, 0, "", "", e.Message);
            return null;
        }
    }

    private static string TryGetMsg(string body)
    {
        try { return JsonDocument.Parse(body).RootElement.GetProperty("message").GetString() ?? "查询失败"; }
        catch { return "查询失败"; }
    }

    private static QuotaData? Parse(string body)
    {
        try
        {
            var json = JsonDocument.Parse(body).RootElement;
            var data = json.GetProperty("data");
            return new QuotaData
            {
                SubscriptionId = data.GetProperty("subscription_id").GetInt32(),
                PlanName = data.GetProperty("plan_name").GetString() ?? "",
                DaysRemaining = data.GetProperty("days_remaining").GetInt32(),
                EndTime = data.GetProperty("end_time").GetString() ?? "",
                Amount = data.GetProperty("amount").GetDouble(),
                AmountUsed = data.GetProperty("amount_used").GetDouble(),
                NextResetTime = data.GetProperty("next_reset_time").GetString() ?? "",
                Status = data.GetProperty("status").GetString() ?? ""
            };
        }
        catch { return null; }
    }
}
