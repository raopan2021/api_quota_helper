using System.Collections.ObjectModel;
using System.Windows.Input;
using ApiQuotaHelper.Models;
using ApiQuotaHelper.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace ApiQuotaHelper.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly AccountService _accountService;
    private readonly QuotaApiService _quotaApi;
    private readonly LogService _logService;
    private readonly SettingsService _settingsService;
    private readonly UpdateService _updateService;
    private System.Timers.Timer? _refreshTimer;
    private System.Timers.Timer? _resetTimer;

    [ObservableProperty] private ObservableCollection<AccountVm> _accounts = [];
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isRefreshing;
    [ObservableProperty] private bool _showAddDialog;
    [ObservableProperty] private AccountVm? _editingAccount;
    [ObservableProperty] private string _dialogUsername = "";
    [ObservableProperty] private string _dialogToken = "";
    [ObservableProperty] private string _dialogError = "";
    [ObservableProperty] private bool _showSettings;
    [ObservableProperty] private bool _showLogs;
    [ObservableProperty] private bool _isDarkMode;
    [ObservableProperty] private int _refreshIntervalSec = 300;
    [ObservableProperty] private string _statusText = "";

    public ObservableCollection<LogEntryVm> Logs { get; } = [];
    [ObservableProperty] private string? _selectedLogType = "额度查询";
    [ObservableProperty] private ObservableCollection<string> _logTypes = ["额度查询"];

    public MainViewModel()
    {
        _accountService = new AccountService();
        _quotaApi = new QuotaApiService(_accountService, _logService = new LogService());
        _settingsService = new SettingsService();
        _updateService = new UpdateService();
        _logService.OnLogAdded += OnLogAdded;

        IsDarkMode = _settingsService.Settings.DarkMode;
        RefreshIntervalSec = _settingsService.Settings.RefreshIntervalSeconds;

        LoadAccounts();
        StartRefreshTimer();
    }

    private void LoadAccounts()
    {
        IsLoading = true;
        var accounts = _accountService.GetAll();
        Accounts.Clear();
        foreach (var acc in accounts)
        {
            var vm = new AccountVm(acc);
            Accounts.Add(vm);
        }
        IsLoading = false;
        if (Accounts.Count > 0) _ = RefreshAllAsync();
    }

    [RelayCommand]
    private async Task RefreshAllAsync()
    {
        if (Accounts.Count == 0) return;
        IsRefreshing = true;
        StatusText = "刷新中...";
        foreach (var acc in Accounts)
        {
            acc.IsLoading = true;
            var quota = await _quotaApi.QueryQuotaAsync(acc.Account);
            acc.Update(quota);
        }
        IsRefreshing = false;
        StatusText = Accounts.Count > 0 ? $"上次刷新: {DateTime.Now:HH:mm:ss}" : "";
    }

    [RelayCommand]
    private async Task RefreshOneAsync(AccountVm acc)
    {
        acc.IsLoading = true;
        var quota = await _quotaApi.QueryQuotaAsync(acc.Account);
        acc.Update(quota);
    }

    [RelayCommand]
    private void ShowAdd()
    {
        EditingAccount = null;
        DialogUsername = "";
        DialogToken = "";
        DialogError = "";
        ShowAddDialog = true;
    }

    [RelayCommand]
    private void ShowEdit(AccountVm acc)
    {
        EditingAccount = acc;
        DialogUsername = acc.Account.Username;
        DialogToken = acc.Account.Token;
        DialogError = "";
        ShowAddDialog = true;
    }

    [RelayCommand]
    private void SaveDialog()
    {
        var username = DialogUsername.Trim();
        var token = DialogToken.Trim();

        if (string.IsNullOrEmpty(username))
        { DialogError = "用户名不能为空"; return; }
        if (string.IsNullOrEmpty(token))
        { DialogError = "Token不能为空"; return; }
        if (Accounts.Any(a => a.Account.Username == username && a.Account.Id != (EditingAccount?.Account.Id ?? "")))
        { DialogError = "用户名已存在"; return; }
        if (Accounts.Any(a => a.Account.Token == token && a.Account.Id != (EditingAccount?.Account.Id ?? "")))
        { DialogError = "Token已存在"; return; }

        var account = new Account
        {
            Id = EditingAccount?.Account.Id ?? _accountService.GenerateId(),
            Username = username,
            Token = token,
            CreatedAt = EditingAccount?.Account.CreatedAt ?? DateTimeOffset.Now.ToUnixTimeMilliseconds()
        };
        _accountService.SaveAccount(account);

        if (EditingAccount == null)
        {
            var vm = new AccountVm(account);
            Accounts.Add(vm);
        }
        else
        {
            EditingAccount.Account.Username = username;
            EditingAccount.Account.Token = token;
        }

        ShowAddDialog = false;
        _ = RefreshOneAsync(Accounts.First(a => a.Account.Id == account.Id));
    }

    [RelayCommand]
    private void CancelDialog()
    {
        ShowAddDialog = false;
    }

    [RelayCommand]
    private void DeleteAccount(AccountVm acc)
    {
        _accountService.DeleteAccount(acc.Account.Id);
        Accounts.Remove(acc);
    }

    [RelayCommand]
    private void ToggleDarkMode()
    {
        IsDarkMode = !IsDarkMode;
        var s = new AppSettings { DarkMode = IsDarkMode, RefreshIntervalSeconds = RefreshIntervalSec };
        _settingsService.Save(s);
    }

    [RelayCommand]
    private void UpdateRefreshInterval(int seconds)
    {
        RefreshIntervalSec = seconds;
        var s = new AppSettings { DarkMode = IsDarkMode, RefreshIntervalSeconds = seconds };
        _settingsService.Save(s);
        StartRefreshTimer();
    }

    private void StartRefreshTimer()
    {
        _refreshTimer?.Dispose();
        if (RefreshIntervalSec <= 0) return;
        _refreshTimer = new System.Timers.Timer(RefreshIntervalSec * 1000);
        _refreshTimer.Elapsed += async (_, _) =>
        {
            if (Accounts.Count > 0) await RefreshAllAsync();
        };
        _refreshTimer.Start();
    }

    private void OnLogAdded()
    {
        Avalonia.Threading.Dispatcher.UIThread.Post(() =>
        {
            Logs.Clear();
            foreach (var l in _logService.GetAll()) Logs.Add(new LogEntryVm(l));
            var types = _logService.GetTypes();
            LogTypes.Clear();
            foreach (var t in types) LogTypes.Add(t);
        });
    }

    [RelayCommand]
    private void ClearLogs()
    {
        _logService.ClearByType("额度查询");
        OnLogAdded();
    }

    [RelayCommand]
    private void SelectLogType(string logType)
    {
        SelectedLogType = logType;
        Logs.Clear();
        foreach (var l in _logService.GetByType(logType)) Logs.Add(new LogEntryVm(l));
    }

    [RelayCommand]
    private void OpenLogs()
    {
        OnLogAdded();
        ShowLogs = true;
    }

    [RelayCommand]
    private void CloseLogs() => ShowLogs = false;

    [RelayCommand]
    private void OpenSettings() => ShowSettings = true;

    [RelayCommand]
    private void CloseSettings() => ShowSettings = false;
}
