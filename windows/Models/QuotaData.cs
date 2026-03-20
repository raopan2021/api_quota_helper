namespace ApiQuotaHelper.Models;

public class QuotaData
{
    public int SubscriptionId { get; set; }
    public string PlanName { get; set; } = "";
    public int DaysRemaining { get; set; }
    public string EndTime { get; set; } = "";
    public double Amount { get; set; }
    public double AmountUsed { get; set; }
    public double Remaining => Amount - AmountUsed;
    public double UsedPercentage => Amount > 0 ? AmountUsed / Amount : 0;
    public string NextResetTime { get; set; } = "";
    public string Status { get; set; } = "";
}
