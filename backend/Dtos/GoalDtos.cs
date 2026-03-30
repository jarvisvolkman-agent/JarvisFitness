using JarvisFitness.Api.Models;

namespace JarvisFitness.Api.Dtos;

public record GoalDto(
    int Id,
    GoalCategory Category,
    string Title,
    decimal? TargetValue,
    string? Unit,
    string? Timeframe,
    GoalStatus Status,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record GoalCreateDto(
    GoalCategory Category,
    string Title,
    decimal? TargetValue,
    string? Unit,
    string? Timeframe,
    GoalStatus? Status,
    string? Notes);

public record GoalUpdateDto(
    GoalCategory? Category,
    string? Title,
    decimal? TargetValue,
    string? Unit,
    string? Timeframe,
    GoalStatus? Status,
    string? Notes);
