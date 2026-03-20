using System.Collections.Concurrent;
using System.Text.Json;
using ApiQuotaHelper.Models;

namespace ApiQuotaHelper.Services;

public class AccountService
{
    private readonly string _filePath;
    private ConcurrentDictionary<string, Account> _accounts = new();

    public AccountService()
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var dir = Path.Combine(appData, "ApiQuotaHelper");
        Directory.CreateDirectory(dir);
        _filePath = Path.Combine(dir, "accounts.json");
        Load();
    }

    private void Load()
    {
        try
        {
            if (File.Exists(_filePath))
            {
                var json = File.ReadAllText(_filePath);
                var accounts = JsonSerializer.Deserialize<List<Account>>(json) ?? [];
                _accounts = new ConcurrentDictionary<string, Account>(
                    accounts.ToDictionary(a => a.Id)
                );
            }
        }
        catch { }
    }

    private void Save()
    {
        try
        {
            var json = JsonSerializer.Serialize(_accounts.Values.ToList(), new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }
        catch { }
    }

    public List<Account> GetAll() => [.. _accounts.Values];

    public void SaveAccount(Account account)
    {
        _accounts[account.Id] = account;
        Save();
    }

    public void DeleteAccount(string id)
    {
        _accounts.TryRemove(id, out _);
        Save();
    }

    public string GenerateId() => Guid.NewGuid().ToString("N")[..12];
}
