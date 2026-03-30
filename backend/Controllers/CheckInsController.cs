using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/check-ins")]
public class CheckInsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> GetAll()
    {
        var checkIns = await db.CheckIns
            .AsNoTracking()
            .OrderByDescending(checkIn => checkIn.CheckInDate)
            .Select(checkIn => Map(checkIn))
            .ToListAsync();

        return Ok(new { checkIns });
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create([FromBody] CheckInCreateDto dto)
    {
        var existing = await db.CheckIns.FirstOrDefaultAsync(x => x.CheckInDate == dto.CheckInDate);
        if (existing is not null)
        {
            return Conflict(new { error = "A check-in already exists for that date." });
        }

        var checkIn = new CheckIn
        {
            CheckInDate = dto.CheckInDate,
            WeightKg = dto.WeightKg,
            CaloriesAvg = dto.CaloriesAvg,
            ProteinGAvg = dto.ProteinGAvg,
            TrainingSessions = dto.TrainingSessions,
            Energy = dto.Energy,
            Adherence = dto.Adherence,
            Notes = dto.Notes
        };

        db.CheckIns.Add(checkIn);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = checkIn.Id }, new { checkIn = Map(checkIn) });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<object>> Update(int id, [FromBody] CheckInUpdateDto dto)
    {
        var checkIn = await db.CheckIns.FindAsync(id);
        if (checkIn is null) return NotFound(new { error = "Check-in not found." });

        if (dto.CheckInDate.HasValue && dto.CheckInDate.Value != checkIn.CheckInDate)
        {
            var existing = await db.CheckIns.FirstOrDefaultAsync(x => x.CheckInDate == dto.CheckInDate.Value && x.Id != id);
            if (existing is not null)
            {
                return Conflict(new { error = "A check-in already exists for that date." });
            }
            checkIn.CheckInDate = dto.CheckInDate.Value;
        }

        checkIn.WeightKg = dto.WeightKg;
        checkIn.CaloriesAvg = dto.CaloriesAvg;
        checkIn.ProteinGAvg = dto.ProteinGAvg;
        checkIn.TrainingSessions = dto.TrainingSessions;
        checkIn.Energy = dto.Energy;
        checkIn.Adherence = dto.Adherence;
        checkIn.Notes = dto.Notes;

        await db.SaveChangesAsync();
        return Ok(new { checkIn = Map(checkIn) });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var checkIn = await db.CheckIns.FindAsync(id);
        if (checkIn is null) return NotFound(new { error = "Check-in not found." });

        db.CheckIns.Remove(checkIn);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static CheckInDto Map(CheckIn checkIn) =>
        new(
            checkIn.Id,
            checkIn.CheckInDate,
            checkIn.WeightKg,
            checkIn.CaloriesAvg,
            checkIn.ProteinGAvg,
            checkIn.TrainingSessions,
            checkIn.Energy,
            checkIn.Adherence,
            checkIn.Notes,
            checkIn.CreatedAt);
}
