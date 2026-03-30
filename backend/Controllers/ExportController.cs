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
        var plans = await db.TrainingPlans.AsNoTracking().Include(plan => plan.Workouts).OrderByDescending(plan => plan.UpdatedAt).ToListAsync();
        var workouts = await db.WorkoutEntries.AsNoTracking().Include(workout => workout.TrainingPlan).OrderByDescending(workout => workout.ScheduledDate).ToListAsync();
        var checkIns = await db.CheckIns.AsNoTracking().OrderByDescending(c => c.CheckInDate).ToListAsync();

        return new ExportDto(
            profile is null ? null : new ProfileDto(
                profile.Id, profile.FullName, profile.Age, profile.Sex, profile.HeightCm, profile.WeightKg,
                profile.ActivityLevel, profile.DietStyle, profile.WorkoutDaysPerWeek, profile.CalorieTarget,
                profile.ProteinTargetG, profile.EquipmentAccess, profile.Injuries, profile.Allergies,
                profile.Notes, profile.UpdatedAt),
            goals.Select(g => new GoalDto(g.Id, g.Category, g.Title, g.TargetValue, g.Unit, g.Timeframe, g.Status, g.Notes, g.CreatedAt, g.UpdatedAt)).ToList(),
            plans.Select(plan => new TrainingPlanDto(plan.Id, plan.Title, plan.Focus, plan.StartDate, plan.EndDate, plan.IsActive, plan.Notes,
                plan.Workouts.Count(workout => workout.Status == WorkoutStatus.Planned),
                plan.Workouts.Count(workout => workout.Status == WorkoutStatus.Completed),
                plan.CreatedAt, plan.UpdatedAt)).ToList(),
            workouts.Select(workout => new WorkoutEntryDto(workout.Id, workout.TrainingPlanId, workout.TrainingPlan?.Title, workout.Title, workout.WorkoutType,
                workout.ScheduledDate, workout.CompletedDate, workout.DurationMinutes, workout.Status, workout.Notes, workout.CreatedAt, workout.UpdatedAt)).ToList(),
            checkIns.Select(c => new CheckInDto(c.Id, c.CheckInDate, c.WeightKg, c.CaloriesAvg, c.ProteinGAvg, c.TrainingSessions, c.Energy, c.Adherence, c.Notes, c.CreatedAt)).ToList());
    }
}
