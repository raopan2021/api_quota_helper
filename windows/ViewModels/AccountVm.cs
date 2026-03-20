using System.Timers;
using ApiQuotaHelper.Models;
using CommunityToolkit.Mvvm.ComponentModel;

namespace ApiQuotaHelper.ViewModels;

public partial class AccountVm : ObservableObject, IDisposable
{
    private System.Timers.Timer? _timer;

    public Account Account { get; }

    [ObservableProperty] private QuotaData? _quota;
    [ObservableProperty] private string? _error;
    [ObservableProperty] private long _lastUpdated;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _countdown = "";

    public double RemainingPercent => Quota != null && Quota.Amount > 0 ? (Quota.AmountUsed / Quota.Amount * 100) : 0;

    public AccountVm(Account account)
    {
        Account = account;
    }

    public void Update(QuotaData? quota)
    {
        Quota = quota;
        Error = null;
        LastUpdated = DateTimeOffset.Now.ToUnixTimeMilliseconds();
        IsLoading = false;
        OnPropertyChanged(nameof(RemainingPercent));
        StartCountdown();
    }

    private void StartCountdown()
    {
        _timer?.Dispose();
        if (string.IsNullOrEmpty(Quota?.NextResetTime)) return;
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += (_, _) =>
        {
            Avalonia.Threading.Dispatcher.UIThread.Post(() =>
            {
                Countdown = CalculateCountdown(Quota!.NextResetTime);
            });
        };
        _timer.Start();
        Countdown = CalculateCountdown(Quota!.NextResetTime);
    }

    private static string CalculateCountdown(string resetTime)
    {
        if (string.IsNullOrEmpty(resetTime)) return "";
        try
        {
            var sdf = new System.Globalization.CultureInfo("zh-CN").DateTimeFormat;
            var resetDate = DateTime.Parse(resetTime);
            var diff = resetDate - DateTime.Now;
            if (diff <= TimeSpan.Zero) return "已重置";
            var h = (int)diff.TotalHours;
            var m = diff.Minutes;
            var s = diff.Seconds;
            return $"{h}小时{m}分{s}秒";
        }
        catch { return ""; }
    }

    public void Dispose()
    {
        _timer?.Stop();
        _timer?.Dispose();
    }
}
