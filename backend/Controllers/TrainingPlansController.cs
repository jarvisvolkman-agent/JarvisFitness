using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/training-plans")]
public class TrainingPlansController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> GetAll()
    {
        var plans = await db.TrainingPlans
            .AsNoTracking()
            .Include(plan => plan.Workouts)
            .OrderByDescending(plan => plan.IsActive)
            .ThenBy(plan => plan.StartDate)
            .ToListAsync();

        return Ok(new { plans = plans.Select(Map).ToList() });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] TrainingPlanCreateDto dto)
    {
        var plan = new TrainingPlan
        {
            Title = dto.Title,
            Focus = dto.Focus,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive ?? true,
            Notes = dto.Notes
        };

        db.TrainingPlans.Add(plan);
        await db.SaveChangesAsync();
        await db.Entry(plan).Collection(x => x.Workouts).LoadAsync();
        return CreatedAtAction(nameof(GetAll), new { id = plan.Id }, new { plan = Map(plan) });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<object>> Update(int id, [FromBody] TrainingPlanUpdateDto dto)
    {
        var plan = await db.TrainingPlans.Include(x => x.Workouts).FirstOrDefaultAsync(x => x.Id == id);
        if (plan is null) return NotFound(new { error = "Tréninkový plán nebyl nalezen." });

        if (dto.Title is not null) plan.Title = dto.Title;
        plan.Focus = dto.Focus;
        if (dto.StartDate.HasValue) plan.StartDate = dto.StartDate.Value;
        plan.EndDate = dto.EndDate;
        if (dto.IsActive.HasValue) plan.IsActive = dto.IsActive.Value;
        plan.Notes = dto.Notes;
        plan.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { plan = Map(plan) });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var plan = await db.TrainingPlans.FindAsync(id);
        if (plan is null) return NotFound(new { error = "Tréninkový plán nebyl nalezen." });

        db.TrainingPlans.Remove(plan);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static TrainingPlanDto Map(TrainingPlan plan) =>
        new(
            plan.Id,
            plan.Title,
            plan.Focus,
            plan.StartDate,
            plan.EndDate,
            plan.IsActive,
            plan.Notes,
            plan.Workouts.Count(workout => workout.Status == WorkoutStatus.Planned),
            plan.Workouts.Count(workout => workout.Status == WorkoutStatus.Completed),
            plan.CreatedAt,
            plan.UpdatedAt);
}
