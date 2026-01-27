using Microsoft.AspNetCore.Mvc;

namespace AssetApi.Controllers;

[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Backend is alive!");
    }
}