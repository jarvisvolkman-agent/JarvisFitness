using JarvisFitness.Api.Models;

namespace JarvisFitness.Api.Dtos;

public record DashboardMetricsDto(
    int ActiveGoalsCount,
    int CompletedGoalsCount,
    int CheckInCount,
    int ActiveTrainingPlansCount,
    int PlannedWorkoutsCount,
    int CompletedWorkoutsCount,
    decimal? LatestWeightKg,
    int? LatestEnergy,
    int? LatestAdherence,
    decimal? WeightChangeKg);

public record DashboardSummaryDto(
    ProfileDto? Profile,
    DashboardMetricsDto Metrics,
    List<GoalDto> ActiveGoals,
    List<TrainingPlanDto> ActiveTrainingPlans,
    List<WorkoutEntryDto> UpcomingWorkouts,
    List<WorkoutEntryDto> RecentCompletedWorkouts,
    List<CheckInDto> RecentCheckIns);

public record ExportDto(
    ProfileDto? Profile,
    List<GoalDto> Goals,
    List<TrainingPlanDto> TrainingPlans,
    List<WorkoutEntryDto> Workouts,
    List<CheckInDto> CheckIns);

public record SearchResultDto(
    string EntityType,
    int EntityId,
    string Title,
    string MatchField,
    string MatchSnippet);
