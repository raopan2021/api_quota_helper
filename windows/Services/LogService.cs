using System.Collections.Concurrent;
using ApiQuotaHelper.Models;

namespace ApiQuotaHelper.Services;

public class LogService
{
    private readonly ConcurrentQueue<LogEntry> _logs = new();
    private const int MaxSize = 50;

    public event Action? OnLogAdded;

    public void LogResponse(
        string logType, string username, string requestBody,
        bool success, int responseCode, string responseMessage,
        string responseBody, string? errorMessage = null)
    {
        var entry = new LogEntry
        {
            LogType = logType,
            Username = username,
            RequestBody = requestBody,
            Success = success,
            ResponseCode = responseCode,
            ResponseMessage = responseMessage,
            ResponseBody = responseBody,
            ErrorMessage = errorMessage
        };
        _logs.Enqueue(entry);
        while (_logs.Count > MaxSize && _logs.TryDequeue(out _)) { }
        OnLogAdded?.Invoke();
    }

    public List<LogEntry> GetAll() => [.. _logs.Reverse()];
    public List<LogEntry> GetByType(string logType) => [.. _logs.Reverse().Where(l => l.LogType == logType)];
    public List<string> GetTypes() => [.. _logs.Select(l => l.LogType).Distinct().OrderBy(t => t)];

    public void Clear() => _logs.Clear();
    public void ClearByType(string logType)
    {
        var keys = _logs.Where(l => l.LogType == logType).Select(l => l.Id).ToHashSet();
        var newLogs = new ConcurrentQueue<LogEntry>(_logs.Where(l => l.Id != 0 && !keys.Contains(l.Id)));
        _logs.Clear();
        foreach (var l in newLogs.Reverse()) _logs.Enqueue(l);
    }
    public void Delete(long id)
    {
        var newLogs = new ConcurrentQueue<LogEntry>(_logs.Where(l => l.Id != id));
        _logs.Clear();
        foreach (var l in newLogs.Reverse()) _logs.Enqueue(l);
    }
}
