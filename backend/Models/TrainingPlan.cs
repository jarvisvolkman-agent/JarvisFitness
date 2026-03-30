namespace JarvisFitness.Api.Models;

public class TrainingPlan
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Focus { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<WorkoutEntry> Workouts { get; set; } = new List<WorkoutEntry>();
}
