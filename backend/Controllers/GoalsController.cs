using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoalsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> GetAll()
    {
        var goals = await db.Goals
            .AsNoTracking()
            .OrderBy(g => g.Status)
            .ThenByDescending(g => g.UpdatedAt)
            .Select(g => Map(g))
            .ToListAsync();

        return Ok(new { goals });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] GoalCreateDto dto)
    {
        var goal = new Goal
        {
            Category = dto.Category,
            Title = dto.Title,
            TargetValue = dto.TargetValue,
            Unit = dto.Unit,
            Timeframe = dto.Timeframe,
            Status = dto.Status ?? GoalStatus.Active,
            Notes = dto.Notes
        };

        db.Goals.Add(goal);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = goal.Id }, new { goal = Map(goal) });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<object>> Update(int id, [FromBody] GoalUpdateDto dto)
    {
        var goal = await db.Goals.FindAsync(id);
        if (goal is null) return NotFound(new { error = "Goal not found." });

        if (dto.Category.HasValue) goal.Category = dto.Category.Value;
        if (dto.Title is not null) goal.Title = dto.Title;
        goal.TargetValue = dto.TargetValue;
        goal.Unit = dto.Unit;
        goal.Timeframe = dto.Timeframe;
        if (dto.Status.HasValue) goal.Status = dto.Status.Value;
        goal.Notes = dto.Notes;
        goal.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { goal = Map(goal) });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var goal = await db.Goals.FindAsync(id);
        if (goal is null) return NotFound(new { error = "Goal not found." });

        db.Goals.Remove(goal);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static GoalDto Map(Goal goal) =>
        new(
            goal.Id,
            goal.Category,
            goal.Title,
            goal.TargetValue,
            goal.Unit,
            goal.Timeframe,
            goal.Status,
            goal.Notes,
            goal.CreatedAt,
            goal.UpdatedAt);
}
