using Microsoft.AspNetCore.Mvc;

namespace JarvisFitness.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<object> Get()
    {
        return new
        {
            status = "ok",
            service = "JarvisFitness.Api",
            utc = DateTime.UtcNow
        };
    }
}
