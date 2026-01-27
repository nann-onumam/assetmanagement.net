using Microsoft.AspNetCore.Mvc;

namespace AssetApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AssetsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAssets()
    {
        return Ok(new[] {
            new { Id = 1, Name = "Laptop", Model = "XPS 13", Value = 1200.00m, CategoryId = 1 },
            new { Id = 2, Name = "Chair", Model = "Ergonomic", Value = 150.00m, CategoryId = 2 }
        });
    }
}