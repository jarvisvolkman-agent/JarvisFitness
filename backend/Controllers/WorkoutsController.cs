using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/workouts")]
public class WorkoutsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> GetAll([FromQuery] WorkoutStatus? status)
    {
        var query = db.WorkoutEntries
            .AsNoTracking()
            .Include(workout => workout.TrainingPlan)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(workout => workout.Status == status.Value);
        }

        var workouts = await query
            .OrderBy(workout => workout.Status)
            .ThenBy(workout => workout.ScheduledDate)
            .ThenBy(workout => workout.Title)
            .ToListAsync();

        return Ok(new { workouts = workouts.Select(Map).ToList() });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] WorkoutEntryCreateDto dto)
    {
        if (dto.TrainingPlanId.HasValue)
        {
            var planExists = await db.TrainingPlans.AnyAsync(plan => plan.Id == dto.TrainingPlanId.Value);
            if (!planExists) return NotFound(new { error = "Navázaný tréninkový plán nebyl nalezen." });
        }

        var workout = new WorkoutEntry
        {
            TrainingPlanId = dto.TrainingPlanId,
            Title = dto.Title,
            WorkoutType = dto.WorkoutType,
            ScheduledDate = dto.ScheduledDate,
            CompletedDate = dto.CompletedDate,
            DurationMinutes = dto.DurationMinutes,
            Status = dto.Status ?? WorkoutStatus.Planned,
            Notes = dto.Notes
        };

        if (workout.Status == WorkoutStatus.Completed && workout.CompletedDate is null)
        {
            workout.CompletedDate = workout.ScheduledDate;
        }

        db.WorkoutEntries.Add(workout);
        await db.SaveChangesAsync();
        await db.Entry(workout).Reference(x => x.TrainingPlan).LoadAsync();

        return CreatedAtAction(nameof(GetAll), new { id = workout.Id }, new { workout = Map(workout) });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<object>> Update(int id, [FromBody] WorkoutEntryUpdateDto dto)
    {
        var workout = await db.WorkoutEntries.Include(x => x.TrainingPlan).FirstOrDefaultAsync(x => x.Id == id);
        if (workout is null) return NotFound(new { error = "Trénink nebyl nalezen." });

        if (dto.TrainingPlanId.HasValue)
        {
            var planExists = await db.TrainingPlans.AnyAsync(plan => plan.Id == dto.TrainingPlanId.Value);
            if (!planExists) return NotFound(new { error = "Navázaný tréninkový plán nebyl nalezen." });
        }

        workout.TrainingPlanId = dto.TrainingPlanId;
        if (dto.Title is not null) workout.Title = dto.Title;
        workout.WorkoutType = dto.WorkoutType;
        if (dto.ScheduledDate.HasValue) workout.ScheduledDate = dto.ScheduledDate.Value;
        workout.CompletedDate = dto.CompletedDate;
        workout.DurationMinutes = dto.DurationMinutes;
        if (dto.Status.HasValue) workout.Status = dto.Status.Value;
        workout.Notes = dto.Notes;
        workout.UpdatedAt = DateTime.UtcNow;

        if (workout.Status == WorkoutStatus.Completed && workout.CompletedDate is null)
        {
            workout.CompletedDate = workout.ScheduledDate;
        }

        await db.SaveChangesAsync();
        await db.Entry(workout).Reference(x => x.TrainingPlan).LoadAsync();
        return Ok(new { workout = Map(workout) });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var workout = await db.WorkoutEntries.FindAsync(id);
        if (workout is null) return NotFound(new { error = "Trénink nebyl nalezen." });

        db.WorkoutEntries.Remove(workout);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static WorkoutEntryDto Map(WorkoutEntry workout) =>
        new(
            workout.Id,
            workout.TrainingPlanId,
            workout.TrainingPlan?.Title,
            workout.Title,
            workout.WorkoutType,
            workout.ScheduledDate,
            workout.CompletedDate,
            workout.DurationMinutes,
            workout.Status,
            workout.Notes,
            workout.CreatedAt,
            workout.UpdatedAt);
}
