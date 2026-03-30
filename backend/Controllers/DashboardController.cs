using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary()
    {
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync();
        var goals = await db.Goals.AsNoTracking().OrderByDescending(g => g.UpdatedAt).ToListAsync();
        var items = await db.PreferenceItems.AsNoTracking().ToListAsync();
        var checkIns = await db.CheckIns.AsNoTracking().OrderByDescending(c => c.CheckInDate).ToListAsync();

        var latest = checkIns.FirstOrDefault();
        var oldest = checkIns.LastOrDefault();

        var summary = new DashboardSummaryDto(
            profile is null ? null : MapProfile(profile),
            new DashboardMetricsDto(
                goals.Count(g => g.Status == GoalStatus.Active),
                goals.Count(g => g.Status == GoalStatus.Completed),
                items.Count(i => i.Kind == ItemKind.Constraint),
                items.Count(i => i.Kind == ItemKind.Preference),
                checkIns.Count,
                latest?.WeightKg,
                latest?.Energy,
                latest?.Adherence,
                latest?.WeightKg is not null && oldest?.WeightKg is not null
                    ? latest.WeightKg - oldest.WeightKg
                    : null),
            goals.Where(g => g.Status == GoalStatus.Active).Take(5).Select(MapGoal).ToList(),
            items.Where(i => i.Kind == ItemKind.Constraint).OrderBy(i => i.Category).Select(MapPreference).ToList(),
            checkIns.Take(6).Select(MapCheckIn).ToList());

        return summary;
    }

    private static ProfileDto MapProfile(FitnessProfile profile) =>
        new(
            profile.Id, profile.FullName, profile.Age, profile.Sex, profile.HeightCm, profile.WeightKg,
            profile.ActivityLevel, profile.DietStyle, profile.WorkoutDaysPerWeek, profile.CalorieTarget,
            profile.ProteinTargetG, profile.EquipmentAccess, profile.Injuries, profile.Allergies,
            profile.Notes, profile.UpdatedAt);

    private static GoalDto MapGoal(Goal goal) =>
        new(goal.Id, goal.Category, goal.Title, goal.TargetValue, goal.Unit, goal.Timeframe, goal.Status, goal.Notes, goal.CreatedAt, goal.UpdatedAt);

    private static PreferenceItemDto MapPreference(PreferenceItem item) =>
        new(item.Id, item.Kind, item.Category, item.Label, item.Value, item.Notes, item.CreatedAt, item.UpdatedAt);

    private static CheckInDto MapCheckIn(CheckIn checkIn) =>
        new(checkIn.Id, checkIn.CheckInDate, checkIn.WeightKg, checkIn.CaloriesAvg, checkIn.ProteinGAvg, checkIn.TrainingSessions, checkIn.Energy, checkIn.Adherence, checkIn.Notes, checkIn.CreatedAt);
}
