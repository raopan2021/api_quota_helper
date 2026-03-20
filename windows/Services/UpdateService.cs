using System.Text.Json;
using ApiQuotaHelper.Models;

namespace ApiQuotaHelper.Services;

public class UpdateService
{
    private const string CurrentVersion = "1.1.0-alpha";
    private const string Repo = "raopan2021/api_quota_helper";

    public async Task<(UpdateInfo? info, string? error, bool isLatest)> CheckAsync()
    {
        try
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
            client.DefaultRequestHeaders.Add("Accept", "application/vnd.github+json");
            var response = await client.GetAsync($"https://api.github.com/repos/{Repo}/releases/latest");
            if (response.StatusCode == System.Net.HttpStatusCode.Forbidden)
                return (null, "请求被限制，请稍后再试", false);
            if (!response.IsSuccessStatusCode)
                return (null, $"HTTP {(int)response.StatusCode}", false);

            var body = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(body);
            var tag = json.RootElement.GetProperty("tag_name").GetString() ?? "";
            var version = tag.TrimStart('v');
            var isLatest = CompareVersion(version, CurrentVersion) <= 0;

            var assets = json.RootElement.GetProperty("assets");
            string? downloadUrl = null;
            foreach (var asset in assets.EnumerateArray())
            {
                var name = asset.GetProperty("name").GetString() ?? "";
                if (name.EndsWith(".exe", StringComparison.OrdinalIgnoreCase) ||
                    name.EndsWith(".zip", StringComparison.OrdinalIgnoreCase))
                {
                    downloadUrl = asset.GetProperty("browser_download_url").GetString();
                    break;
                }
            }

            return (new UpdateInfo
            {
                Version = version,
                DownloadUrl = downloadUrl ?? json.RootElement.GetProperty("html_url").GetString() ?? "",
                ReleaseNotes = json.RootElement.TryGetProperty("body", out var bodyEl) ? (bodyEl.GetString() ?? "") : ""
            }, null, isLatest);
        }
        catch (Exception e)
        {
            return (null, e.Message, false);
        }
    }

    private static int CompareVersion(string latest, string current)
    {
        try
        {
            var lp = latest.Split('.').Select(int.Parse).ToArray();
            var cp = current.Split('.').Select(int.Parse).ToArray();
            var len = Math.Max(lp.Length, cp.Length);
            for (int i = 0; i < len; i++)
            {
                var l = i < lp.Length ? lp[i] : 0;
                var c = i < cp.Length ? cp[i] : 0;
                if (l > c) return 1;
                if (c > l) return -1;
            }
            return 0;
        }
        catch { return latest != current ? (latest.CompareTo(current) > 0 ? 1 : -1) : 0; }
    }
}
