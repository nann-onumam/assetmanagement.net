using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssetApi.Data;
using AssetApi.Models;

namespace AssetApi.Controllers;

// ==================================================================================
// 1. API STRUCTURE & DEPENDENCY INJECTION
// ==================================================================================

// [บทที่ 9: Creating a Web API - Section 9.1.1 The [ApiController] attribute] 
// การใช้ Attribute เพื่อจัดการพฤติกรรมพื้นฐานของ API เช่น Automatic HTTP 400 responses
[Route("api/[controller]")]
[ApiController]
// [บทที่ 10: Configured with Dependency Injection] - ใช้ Primary Constructor (C# 12) 
// เพื่อรับ AssetDbContext มาใช้งานโดยไม่ต้องประกาศตัวแปร Field ให้รกรุงรัง
public class CategoriesController(AssetDbContext context) : ControllerBase
{
    // ==============================================================================
    // 2. DATA RETRIEVAL FOR DROPDOWNS
    // ==============================================================================

    // [บทที่ 9.2: Creating an endpoint] - กำหนดทางเข้าสำหรับดึงข้อมูลหมวดหมู่ทั้งหมด
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Category>>> GetCategories() =>
        // [Head First SQL, บทที่ 4: Smart Table Design] 
        // ดึงเฉพาะข้อมูลพื้นฐานจากตาราง Category เพื่อนำไปใช้ใน Dropdown ของ UI
        // [ASP.NET Core in Action, บทที่ 12.4.3: Querying data] - ดึงข้อมูลแบบ Asynchronous
        await context.Categories.ToListAsync();

    // [Programming Logic and Design, บทที่ 9: Advanced Modularization Techniques]
    // แม้โจทย์จะเน้นแค่ Dropdown แต่การมี GetById ช่วยให้ระบบยืดหยุ่นขึ้นในอนาคต
    [HttpGet("{id}")]
    public async Task<ActionResult<Category>> GetCategory(int id)
    {
        var category = await context.Categories.FindAsync(id);

        // [Programming Logic and Design, บทที่ 4: Making Decisions] 
        // การตรวจสอบความมีอยู่ของข้อมูล (Existence Check) ก่อนส่งผลลัพธ์
        return category == null ? NotFound() : category;
    }
}