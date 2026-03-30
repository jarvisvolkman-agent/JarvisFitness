using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PreferencesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> GetAll([FromQuery] ItemKind? kind)
    {
        var query = db.PreferenceItems.AsNoTracking().AsQueryable();
        if (kind.HasValue)
        {
            query = query.Where(item => item.Kind == kind.Value);
        }

        var items = await query
            .OrderBy(item => item.Kind)
            .ThenBy(item => item.Category)
            .ThenBy(item => item.Label)
            .Select(item => Map(item))
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] PreferenceItemCreateDto dto)
    {
        var item = new PreferenceItem
        {
            Kind = dto.Kind,
            Category = dto.Category,
            Label = dto.Label,
            Value = dto.Value,
            Notes = dto.Notes
        };

        db.PreferenceItems.Add(item);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = item.Id }, new { item = Map(item) });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<object>> Update(int id, [FromBody] PreferenceItemUpdateDto dto)
    {
        var item = await db.PreferenceItems.FindAsync(id);
        if (item is null) return NotFound(new { error = "Položka nebyla nalezena." });

        if (dto.Kind.HasValue) item.Kind = dto.Kind.Value;
        if (dto.Category.HasValue) item.Category = dto.Category.Value;
        if (dto.Label is not null) item.Label = dto.Label;
        item.Value = dto.Value;
        item.Notes = dto.Notes;
        item.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { item = Map(item) });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await db.PreferenceItems.FindAsync(id);
        if (item is null) return NotFound(new { error = "Položka nebyla nalezena." });

        db.PreferenceItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static PreferenceItemDto Map(PreferenceItem item) =>
        new(
            item.Id,
            item.Kind,
            item.Category,
            item.Label,
            item.Value,
            item.Notes,
            item.CreatedAt,
            item.UpdatedAt);
}
