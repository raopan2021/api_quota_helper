using ApiQuotaHelper.Models;
using CommunityToolkit.Mvvm.ComponentModel;

namespace ApiQuotaHelper.ViewModels;

public partial class AccountVm : ObservableObject
{
    public Account Account { get; }

    [ObservableProperty] private QuotaData? _quota;
    [ObservableProperty] private string? _error;
    [ObservableProperty] private long _lastUpdated;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string _countdown = "";

    public double RemainingPercent => Quota != null && Quota.Amount > 0 ? (Quota.AmountUsed / Quota.Amount * 100) : 0;
    public string StatusColor => RemainingPercent switch { > 50 => "#4CAF50", > 20 => "#2196F3", _ => "#F44336" };

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
        OnPropertyChanged(nameof(StatusColor));
    }
}
