namespace ApiQuotaHelper.Models;

public class AppSettings
{
    public bool DarkMode { get; set; } = false;
    public int RefreshIntervalSeconds { get; set; } = 300; // 默认5分钟
}
