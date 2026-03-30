namespace JarvisFitness.Api.Models;

public class CheckIn
{
    public int Id { get; set; }
    public DateOnly CheckInDate { get; set; }
    public decimal? WeightKg { get; set; }
    public int? CaloriesAvg { get; set; }
    public int? ProteinGAvg { get; set; }
    public int? TrainingSessions { get; set; }
    public int? Energy { get; set; }
    public int? Adherence { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
