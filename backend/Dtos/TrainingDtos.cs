using JarvisFitness.Api.Models;

namespace JarvisFitness.Api.Dtos;

public record TrainingPlanDto(
    int Id,
    string Title,
    string? Focus,
    DateOnly StartDate,
    DateOnly? EndDate,
    bool IsActive,
    string? Notes,
    int PlannedWorkoutCount,
    int CompletedWorkoutCount,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record TrainingPlanCreateDto(
    string Title,
    string? Focus,
    DateOnly StartDate,
    DateOnly? EndDate,
    bool? IsActive,
    string? Notes);

public record TrainingPlanUpdateDto(
    string? Title,
    string? Focus,
    DateOnly? StartDate,
    DateOnly? EndDate,
    bool? IsActive,
    string? Notes);

public record WorkoutEntryDto(
    int Id,
    int? TrainingPlanId,
    string? TrainingPlanTitle,
    string Title,
    string? WorkoutType,
    DateOnly ScheduledDate,
    DateOnly? CompletedDate,
    int? DurationMinutes,
    WorkoutStatus Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record WorkoutEntryCreateDto(
    int? TrainingPlanId,
    string Title,
    string? WorkoutType,
    DateOnly ScheduledDate,
    DateOnly? CompletedDate,
    int? DurationMinutes,
    WorkoutStatus? Status,
    string? Notes);

public record WorkoutEntryUpdateDto(
    int? TrainingPlanId,
    string? Title,
    string? WorkoutType,
    DateOnly? ScheduledDate,
    DateOnly? CompletedDate,
    int? DurationMinutes,
    WorkoutStatus? Status,
    string? Notes);
