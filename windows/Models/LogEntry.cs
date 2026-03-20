namespace ApiQuotaHelper.Models;

public class LogEntry
{
    public long Id { get; set; } = DateTimeOffset.Now.ToUnixTimeMilliseconds();
    public string Time { get; set; } = DateTime.Now.ToString("HH:mm:ss");
    public bool Success { get; set; }
    public string LogType { get; set; } = "";
    public string Username { get; set; } = "";
    public string RequestBody { get; set; } = "";
    public int ResponseCode { get; set; }
    public string ResponseMessage { get; set; } = "";
    public string ResponseBody { get; set; } = "";
    public string? ErrorMessage { get; set; }
}
