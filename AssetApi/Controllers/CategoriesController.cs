using Microsoft.AspNetCore.Mvc;

namespace AssetApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    [HttpGet]
    public IActionResult GetCategories()
    {
        return Ok(new[] {
            new { Id = 1, Name = "Electronics" },
            new { Id = 2, Name = "Furniture" },
            new { Id = 3, Name = "Vehicles" },
            new { Id = 4, Name = "Appliances" }
        });
    }
}