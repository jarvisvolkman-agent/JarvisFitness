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
            status = "v poradku",
            service = "JarvisFitness.Api",
            utc = DateTime.UtcNow
        };
    }
}
