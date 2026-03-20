using System.Timers;
using ApiQuotaHelper.Models;
using CommunityToolkit.Mvvm.ComponentModel;
using ApiQuotaHelper.Services;

namespace ApiQuotaHelper.ViewModels;

public partial class ResetCountdownVm : ObservableObject, IDisposable
{
    private readonly System.Timers.Timer _timer;
    private readonly Func<string, string> _calculateCountdown;

    [ObservableProperty] private string _countdown = "";

    public ResetCountdownVm(string resetTime, Action onReset, Func<string, string> calculateCountdown)
    {
        _calculateCountdown = calculateCountdown;
        var wasReset = false;
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += (_, _) =>
        {
            var c = _calculateCountdown(resetTime);
            Avalonia.Threading.Dispatcher.UIThread.Post(() => Countdown = c);
            if (!wasReset && c == "已重置")
            {
                wasReset = true;
                onReset();
            }
            if (c != "已重置") wasReset = false;
        };
        _timer.Start();
    }

    public void Dispose()
    {
        _timer.Stop();
        _timer.Dispose();
    }
}
