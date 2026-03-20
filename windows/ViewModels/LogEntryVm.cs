using ApiQuotaHelper.Models;
using CommunityToolkit.Mvvm.ComponentModel;

namespace ApiQuotaHelper.ViewModels;

public class LogEntryVm
{
    public long Id { get; }
    public string Time { get; }
    public bool Success { get; }
    public string LogType { get; }
    public string Username { get; }
    public string RequestBody { get; }
    public int ResponseCode { get; }
    public string ResponseMessage { get; }
    public string ResponseBody { get; }
    public string? ErrorMessage { get; }

    public LogEntryVm(LogEntry entry)
    {
        Id = entry.Id;
        Time = entry.Time;
        Success = entry.Success;
        LogType = entry.LogType;
        Username = entry.Username;
        RequestBody = entry.RequestBody;
        ResponseCode = entry.ResponseCode;
        ResponseMessage = entry.ResponseMessage;
        ResponseBody = entry.ResponseBody;
        ErrorMessage = entry.ErrorMessage;
    }
}
