using JarvisFitness.Api.Models;

namespace JarvisFitness.Api.Dtos;

public record PreferenceItemDto(
    int Id,
    ItemKind Kind,
    PreferenceCategory Category,
    string Label,
    string? Value,
    string? Notes,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record PreferenceItemCreateDto(
    ItemKind Kind,
    PreferenceCategory Category,
    string Label,
    string? Value,
    string? Notes);

public record PreferenceItemUpdateDto(
    ItemKind? Kind,
    PreferenceCategory? Category,
    string? Label,
    string? Value,
    string? Notes);
