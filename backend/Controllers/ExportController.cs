using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExportController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ExportDto>> Get()
    {
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync();
        var goals = await db.Goals.AsNoTracking().OrderByDescending(g => g.UpdatedAt).ToListAsync();
        var preferences = await db.PreferenceItems.AsNoTracking().OrderBy(p => p.Kind).ThenBy(p => p.Label).ToListAsync();
        var checkIns = await db.CheckIns.AsNoTracking().OrderByDescending(c => c.CheckInDate).ToListAsync();

        return new ExportDto(
            profile is null ? null : new ProfileDto(
                profile.Id, profile.FullName, profile.Age, profile.Sex, profile.HeightCm, profile.WeightKg,
                profile.ActivityLevel, profile.DietStyle, profile.WorkoutDaysPerWeek, profile.CalorieTarget,
                profile.ProteinTargetG, profile.EquipmentAccess, profile.Injuries, profile.Allergies,
                profile.Notes, profile.UpdatedAt),
            goals.Select(g => new GoalDto(g.Id, g.Category, g.Title, g.TargetValue, g.Unit, g.Timeframe, g.Status, g.Notes, g.CreatedAt, g.UpdatedAt)).ToList(),
            preferences.Select(p => new PreferenceItemDto(p.Id, p.Kind, p.Category, p.Label, p.Value, p.Notes, p.CreatedAt, p.UpdatedAt)).ToList(),
            checkIns.Select(c => new CheckInDto(c.Id, c.CheckInDate, c.WeightKg, c.CaloriesAvg, c.ProteinGAvg, c.TrainingSessions, c.Energy, c.Adherence, c.Notes, c.CreatedAt)).ToList());
    }
}
