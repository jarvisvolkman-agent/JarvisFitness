namespace JarvisFitness.Api.Models;

public enum GoalCategory
{
    Weight,
    Performance,
    Nutrition,
    Habit
}

public enum GoalStatus
{
    Active,
    Paused,
    Completed
}

public class Goal
{
    public int Id { get; set; }
    public GoalCategory Category { get; set; }
    public required string Title { get; set; }
    public decimal? TargetValue { get; set; }
    public string? Unit { get; set; }
    public string? Timeframe { get; set; }
    public GoalStatus Status { get; set; } = GoalStatus.Active;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
