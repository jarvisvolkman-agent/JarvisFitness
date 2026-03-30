using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SearchResultDto>>> Search([FromQuery] string q)
    {
        var query = q.Trim();
        if (query.Length < 2)
        {
            return BadRequest(new { error = "Dotaz musí mít alespoň 2 znaky." });
        }

        var pattern = $"%{query}%";
        var results = new List<SearchResultDto>();

        var goals = await db.Goals.AsNoTracking()
            .Where(g => EF.Functions.ILike(g.Title, pattern) || (g.Notes != null && EF.Functions.ILike(g.Notes, pattern)))
            .Take(10)
            .ToListAsync();
        results.AddRange(goals.Select(g => new SearchResultDto("goal", g.Id, g.Title, "cil", g.Notes ?? g.Title)));

        var plans = await db.TrainingPlans.AsNoTracking()
            .Where(plan => EF.Functions.ILike(plan.Title, pattern) || (plan.Focus != null && EF.Functions.ILike(plan.Focus, pattern)) || (plan.Notes != null && EF.Functions.ILike(plan.Notes, pattern)))
            .Take(10)
            .ToListAsync();
        results.AddRange(plans.Select(plan => new SearchResultDto("training-plan", plan.Id, plan.Title, "plan", plan.Focus ?? plan.Notes ?? plan.Title)));

        var workouts = await db.WorkoutEntries.AsNoTracking()
            .Include(workout => workout.TrainingPlan)
            .Where(workout => EF.Functions.ILike(workout.Title, pattern)
                || (workout.WorkoutType != null && EF.Functions.ILike(workout.WorkoutType, pattern))
                || (workout.Notes != null && EF.Functions.ILike(workout.Notes, pattern)))
            .Take(10)
            .ToListAsync();
        results.AddRange(workouts.Select(workout => new SearchResultDto(
            workout.Status == Models.WorkoutStatus.Completed ? "completed-workout" : "planned-workout",
            workout.Id,
            workout.Title,
            workout.Status == Models.WorkoutStatus.Completed ? "odcviceny-trenink" : "planovany-trenink",
            workout.Notes ?? workout.WorkoutType ?? workout.TrainingPlan?.Title ?? workout.Title)));

        var checkIns = await db.CheckIns.AsNoTracking()
            .Where(c => c.Notes != null && EF.Functions.ILike(c.Notes, pattern))
            .OrderByDescending(c => c.CheckInDate)
            .Take(10)
            .ToListAsync();
        results.AddRange(checkIns.Select(c => new SearchResultDto("check-in", c.Id, c.CheckInDate.ToString("yyyy-MM-dd"), "poznamky", c.Notes ?? string.Empty)));

        var profile = await db.Profiles.AsNoTracking()
            .FirstOrDefaultAsync(p =>
                EF.Functions.ILike(p.FullName, pattern) ||
                (p.DietStyle != null && EF.Functions.ILike(p.DietStyle, pattern)) ||
                (p.Notes != null && EF.Functions.ILike(p.Notes, pattern)) ||
                (p.EquipmentAccess != null && EF.Functions.ILike(p.EquipmentAccess, pattern)));

        if (profile is not null)
        {
            results.Add(new SearchResultDto("profile", profile.Id, profile.FullName, "profil", profile.Notes ?? profile.DietStyle ?? profile.FullName));
        }

        return results
            .DistinctBy(x => $"{x.EntityType}:{x.EntityId}")
            .Take(20)
            .ToList();
    }
}
