using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AssetApi.Data;
using AssetApi.Models;

namespace AssetApi.Controllers;

// ==================================================================================
// 1. API CONTROLLER STRUCTURE
// ==================================================================================

// [บทที่ 9: Creating a Web API - Section 9.1.1 The [ApiController] attribute] 
// การใช้ Attribute เพื่อช่วยจัดการพฤติกรรมของ API เช่นการตรวจสอบ Model State อัตโนมัติ
[Route("api/[controller]")]
[ApiController]
// [บทที่ 10: Configured with Dependency Injection] - การใช้ Primary Constructor (C# 12) 
// เพื่อฉีด (Inject) AssetDbContext เข้ามาใช้งานใน Controller อย่างสะอาดตา
public class AssetsController(AssetDbContext context) : ControllerBase
{
    // ==============================================================================
    // 2. READ OPERATIONS (GET)
    // ==============================================================================

    // [บทที่ 9.2: Creating an endpoint] - กำหนดทางเข้า (Endpoint) สำหรับเรียกดูข้อมูลทั้งหมด
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Asset>>> GetAssets() =>
        // [Head First SQL, บทที่ 7: Multi-table Database Design] 
        // การใช้ .Include() เพื่อดึงข้อมูลข้ามตาราง (Category) ตามความสัมพันธ์ที่ออกแบบไว้
        await context.Assets.Include(a => a.Category).ToListAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Asset>> GetAsset(int id)
    {
        // [บทที่ 12.4.3 Querying data from the database] - การค้นหาข้อมูลแบบเจาะจงด้วย Primary Key
        var asset = await context.Assets.Include(a => a.Category)
            .FirstOrDefaultAsync(a => a.Id == id);

        // [Programming Logic and Design, บทที่ 4: Making Decisions] 
        // การใช้เงื่อนไขตรวจสอบเพื่อส่งผลลัพธ์ที่ถูกต้อง (404 Not Found หรือ 200 OK)
        return asset == null ? NotFound() : asset;
    }

    // ==============================================================================
    // 3. WRITE OPERATIONS (POST/PUT/DELETE)
    // ==============================================================================

    [HttpPost]
    public async Task<ActionResult<Asset>> PostAsset(Asset asset)
    {
        // [บทที่ 12.4.1 Adding data to the database] - บันทึกวัตถุใหม่ลงในตาราง
        context.Assets.Add(asset);
        await context.SaveChanges(); // [บทที่ 12.4: Saving Data] - ยืนยันการเปลี่ยนแปลง

        return CreatedAtAction(nameof(GetAsset), new { id = asset.Id }, asset);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutAsset(int id, Asset asset)
    {
        // [Programming Logic and Design, บทที่ 2: Elements of High-Quality Programs] 
        // การตรวจสอบความถูกต้องเบื้องต้น (Validation) ว่า Id ตรงกับข้อมูลที่ส่งมาหรือไม่
        if (id != asset.Id) return BadRequest();

        context.Entry(asset).State = EntityState.Modified;

        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // [Programming Logic and Design, บทที่ 13: Exception Handling] 
            // การดักจับข้อผิดพลาดเมื่อมีการแก้ไขข้อมูลพร้อมกัน (Concurrency)
            if (!AssetExists(id)) return NotFound();
            throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAsset(int id)
    {
        var asset = await context.Assets.FindAsync(id);
        if (asset == null) return NotFound();

        context.Assets.Remove(asset);
        await context.SaveChangesAsync();

        return NoContent();
    }

    // [Programming Logic and Design, บทที่ 9: Modularization Techniques] 
    // แยกตรรกะการตรวจสอบออกเป็น Method ย่อยเพื่อให้โค้ดส่วนอื่น Lean และอ่านง่าย
    private bool AssetExists(int id) => context.Assets.Any(e => e.Id == id);
}