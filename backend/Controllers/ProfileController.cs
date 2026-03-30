using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfileController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<object>> Get()
    {
        var profile = await db.Profiles.AsNoTracking().FirstOrDefaultAsync();
        return Ok(new { profile = profile is null ? null : Map(profile) });
    }

    [HttpPut]
    public async Task<ActionResult<object>> Upsert([FromBody] ProfileUpsertDto dto)
    {
        var profile = await db.Profiles.FirstOrDefaultAsync();
        if (profile is null)
        {
            profile = new FitnessProfile { Id = 1, FullName = dto.FullName };
            db.Profiles.Add(profile);
        }

        profile.FullName = dto.FullName;
        profile.Age = dto.Age;
        profile.Sex = dto.Sex;
        profile.HeightCm = dto.HeightCm;
        profile.WeightKg = dto.WeightKg;
        profile.ActivityLevel = dto.ActivityLevel;
        profile.DietStyle = dto.DietStyle;
        profile.WorkoutDaysPerWeek = dto.WorkoutDaysPerWeek;
        profile.CalorieTarget = dto.CalorieTarget;
        profile.ProteinTargetG = dto.ProteinTargetG;
        profile.EquipmentAccess = dto.EquipmentAccess;
        profile.Injuries = dto.Injuries;
        profile.Allergies = dto.Allergies;
        profile.Notes = dto.Notes;
        profile.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { profile = Map(profile) });
    }

    private static ProfileDto Map(FitnessProfile profile) =>
        new(
            profile.Id,
            profile.FullName,
            profile.Age,
            profile.Sex,
            profile.HeightCm,
            profile.WeightKg,
            profile.ActivityLevel,
            profile.DietStyle,
            profile.WorkoutDaysPerWeek,
            profile.CalorieTarget,
            profile.ProteinTargetG,
            profile.EquipmentAccess,
            profile.Injuries,
            profile.Allergies,
            profile.Notes,
            profile.UpdatedAt);
}
