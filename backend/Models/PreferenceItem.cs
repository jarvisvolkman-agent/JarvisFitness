namespace JarvisFitness.Api.Models;

public enum ItemKind
{
    Preference,
    Constraint
}

public enum PreferenceCategory
{
    Nutrition,
    Training,
    Schedule,
    Medical,
    Lifestyle
}

public class PreferenceItem
{
    public int Id { get; set; }
    public ItemKind Kind { get; set; }
    public PreferenceCategory Category { get; set; }
    public required string Label { get; set; }
    public string? Value { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
