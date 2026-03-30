using JarvisFitness.Api.Models;

namespace JarvisFitness.Api.Dtos;

public record DashboardMetricsDto(
    int ActiveGoalsCount,
    int CompletedGoalsCount,
    int ConstraintsCount,
    int PreferencesCount,
    int CheckInCount,
    decimal? LatestWeightKg,
    int? LatestEnergy,
    int? LatestAdherence,
    decimal? WeightChangeKg);

public record DashboardSummaryDto(
    ProfileDto? Profile,
    DashboardMetricsDto Metrics,
    List<GoalDto> ActiveGoals,
    List<PreferenceItemDto> Constraints,
    List<CheckInDto> RecentCheckIns);

public record ExportDto(
    ProfileDto? Profile,
    List<GoalDto> Goals,
    List<PreferenceItemDto> Preferences,
    List<CheckInDto> CheckIns);

public record SearchResultDto(
    string EntityType,
    int EntityId,
    string Title,
    string MatchField,
    string MatchSnippet);
