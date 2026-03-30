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
        var plans = await db.TrainingPlans.AsNoTracking().Include(plan => plan.Workouts).OrderByDescending(plan => plan.UpdatedAt).ToListAsync();
        var workouts = await db.WorkoutEntries.AsNoTracking().Include(workout => workout.TrainingPlan).OrderBy(workout => workout.ScheduledDate).ToListAsync();
        var checkIns = await db.CheckIns.AsNoTracking().OrderByDescending(c => c.CheckInDate).ToListAsync();

        var latest = checkIns.FirstOrDefault();
        var oldest = checkIns.LastOrDefault();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var summary = new DashboardSummaryDto(
            profile is null ? null : MapProfile(profile),
            new DashboardMetricsDto(
                goals.Count(g => g.Status == GoalStatus.Active),
                goals.Count(g => g.Status == GoalStatus.Completed),
                checkIns.Count,
                plans.Count(plan => plan.IsActive),
                workouts.Count(workout => workout.Status == WorkoutStatus.Planned && workout.ScheduledDate >= today),
                workouts.Count(workout => workout.Status == WorkoutStatus.Completed),
                latest?.WeightKg,
                latest?.Energy,
                latest?.Adherence,
                latest?.WeightKg is not null && oldest?.WeightKg is not null ? latest.WeightKg - oldest.WeightKg : null),
            goals.Where(g => g.Status == GoalStatus.Active).Take(5).Select(MapGoal).ToList(),
            plans.Where(plan => plan.IsActive).Take(4).Select(MapPlan).ToList(),
            workouts.Where(workout => workout.Status == WorkoutStatus.Planned && workout.ScheduledDate >= today).Take(5).Select(MapWorkout).ToList(),
            workouts.Where(workout => workout.Status == WorkoutStatus.Completed).OrderByDescending(workout => workout.CompletedDate ?? workout.ScheduledDate).Take(5).Select(MapWorkout).ToList(),
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

    private static TrainingPlanDto MapPlan(TrainingPlan plan) =>
        new(plan.Id, plan.Title, plan.Focus, plan.StartDate, plan.EndDate, plan.IsActive, plan.Notes,
            plan.Workouts.Count(workout => workout.Status == WorkoutStatus.Planned),
            plan.Workouts.Count(workout => workout.Status == WorkoutStatus.Completed),
            plan.CreatedAt, plan.UpdatedAt);

    private static WorkoutEntryDto MapWorkout(WorkoutEntry workout) =>
        new(workout.Id, workout.TrainingPlanId, workout.TrainingPlan?.Title, workout.Title, workout.WorkoutType,
            workout.ScheduledDate, workout.CompletedDate, workout.DurationMinutes, workout.Status, workout.Notes,
            workout.CreatedAt, workout.UpdatedAt);

    private static CheckInDto MapCheckIn(CheckIn checkIn) =>
        new(checkIn.Id, checkIn.CheckInDate, checkIn.WeightKg, checkIn.CaloriesAvg, checkIn.ProteinGAvg, checkIn.TrainingSessions, checkIn.Energy, checkIn.Adherence, checkIn.Notes, checkIn.CreatedAt);
}
