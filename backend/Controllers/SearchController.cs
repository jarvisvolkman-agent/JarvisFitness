using JarvisFitness.Api.Data;
using JarvisFitness.Api.Dtos;
using JarvisFitness.Api.Models;
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

        var items = await db.PreferenceItems.AsNoTracking()
            .Where(i => EF.Functions.ILike(i.Label, pattern) || (i.Value != null && EF.Functions.ILike(i.Value, pattern)) || (i.Notes != null && EF.Functions.ILike(i.Notes, pattern)))
            .Take(10)
            .ToListAsync();
        results.AddRange(items.Select(i => new SearchResultDto(
            i.Kind == ItemKind.Constraint ? "constraint" : "preference",
            i.Id,
            i.Label,
            i.Kind == ItemKind.Constraint ? "omezeni" : "preference",
            i.Value ?? i.Notes ?? i.Label)));

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
