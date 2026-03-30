namespace JarvisFitness.Api.Dtos;

public record CheckInDto(
    int Id,
    DateOnly CheckInDate,
    decimal? WeightKg,
    int? CaloriesAvg,
    int? ProteinGAvg,
    int? TrainingSessions,
    int? Energy,
    int? Adherence,
    string? Notes,
    DateTime CreatedAt);

public record CheckInCreateDto(
    DateOnly CheckInDate,
    decimal? WeightKg,
    int? CaloriesAvg,
    int? ProteinGAvg,
    int? TrainingSessions,
    int? Energy,
    int? Adherence,
    string? Notes);

public record CheckInUpdateDto(
    DateOnly? CheckInDate,
    decimal? WeightKg,
    int? CaloriesAvg,
    int? ProteinGAvg,
    int? TrainingSessions,
    int? Energy,
    int? Adherence,
    string? Notes);
