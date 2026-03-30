namespace JarvisFitness.Api.Models;

public enum ActivityLevel
{
    Sedentary,
    LightlyActive,
    ModeratelyActive,
    VeryActive
}

public class FitnessProfile
{
    public int Id { get; set; } = 1;
    public required string FullName { get; set; }
    public int? Age { get; set; }
    public string? Sex { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }
    public ActivityLevel ActivityLevel { get; set; } = ActivityLevel.ModeratelyActive;
    public string? DietStyle { get; set; }
    public int? WorkoutDaysPerWeek { get; set; }
    public int? CalorieTarget { get; set; }
    public int? ProteinTargetG { get; set; }
    public string? EquipmentAccess { get; set; }
    public string? Injuries { get; set; }
    public string? Allergies { get; set; }
    public string? Notes { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
