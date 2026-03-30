namespace JarvisFitness.Api.Models;

public enum WorkoutStatus
{
    Planned,
    Completed,
    Missed
}

public class WorkoutEntry
{
    public int Id { get; set; }
    public int? TrainingPlanId { get; set; }
    public TrainingPlan? TrainingPlan { get; set; }
    public required string Title { get; set; }
    public string? WorkoutType { get; set; }
    public DateOnly ScheduledDate { get; set; }
    public DateOnly? CompletedDate { get; set; }
    public int? DurationMinutes { get; set; }
    public WorkoutStatus Status { get; set; } = WorkoutStatus.Planned;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
