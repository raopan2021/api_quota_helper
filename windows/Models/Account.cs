namespace ApiQuotaHelper.Models;

public class Account
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N")[..12];
    public string Username { get; set; } = "";
    public string Token { get; set; } = "";
    public long CreatedAt { get; set; } = DateTimeOffset.Now.ToUnixTimeMilliseconds();
}
