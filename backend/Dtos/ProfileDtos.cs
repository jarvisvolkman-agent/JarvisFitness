using JarvisFitness.Api.Models;

namespace JarvisFitness.Api.Dtos;

public record ProfileDto(
    int Id,
    string FullName,
    int? Age,
    string? Sex,
    decimal? HeightCm,
    decimal? WeightKg,
    ActivityLevel ActivityLevel,
    string? DietStyle,
    int? WorkoutDaysPerWeek,
    int? CalorieTarget,
    int? ProteinTargetG,
    string? EquipmentAccess,
    string? Injuries,
    string? Allergies,
    string? Notes,
    DateTime UpdatedAt);

public record ProfileUpsertDto(
    string FullName,
    int? Age,
    string? Sex,
    decimal? HeightCm,
    decimal? WeightKg,
    ActivityLevel ActivityLevel,
    string? DietStyle,
    int? WorkoutDaysPerWeek,
    int? CalorieTarget,
    int? ProteinTargetG,
    string? EquipmentAccess,
    string? Injuries,
    string? Allergies,
    string? Notes);
