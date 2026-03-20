using System.Text.Json;
using ApiQuotaHelper.Models;

namespace ApiQuotaHelper.Services;

public class SettingsService
{
    private readonly string _filePath;
    public AppSettings Settings { get; private set; } = new();

    public event Action<AppSettings>? OnSettingsChanged;

    public SettingsService()
    {
        var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var dir = Path.Combine(appData, "ApiQuotaHelper");
        Directory.CreateDirectory(dir);
        _filePath = Path.Combine(dir, "settings.json");
        Load();
    }

    private void Load()
    {
        try
        {
            if (File.Exists(_filePath))
            {
                var json = File.ReadAllText(_filePath);
                Settings = JsonSerializer.Deserialize<AppSettings>(json) ?? new();
            }
        }
        catch { Settings = new(); }
    }

    public void Save(AppSettings settings)
    {
        Settings = settings;
        try
        {
            var json = JsonSerializer.Serialize(Settings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
            OnSettingsChanged?.Invoke(Settings);
        }
        catch { }
    }
}
