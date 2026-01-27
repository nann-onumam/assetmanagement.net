using Microsoft.EntityFrameworkCore;
using AssetApi.Data;
using AssetApi.Models;
using AssetApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// ==================================================================================
// 1. SERVICE REGISTRATION
// ==================================================================================

// [บทที่ 10: Configured with Dependency Injection] - การลงทะเบียน Service เพื่อให้ระบบจัดการ Life cycle ของ Object
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// [บทที่ 12: Interacting with Python and EF Core] - การตั้งค่า DbContext สำหรับ SQLite
// ใช้ SQLite สำหรับการพัฒนาและทดสอบได้ง่าย ไม่ต้องติดตั้ง MySQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AssetDbContext>(options =>
    options.UseSqlite(connectionString));

// [บทที่ 18: Securing your application - Section 18.4 CORS] - อนุญาตให้ Angular เข้าถึง API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// ==================================================================================
// 2. MIDDLEWARE PIPELINE
// ==================================================================================

// [บทที่ 3: The Middleware Pipeline - Section 3.3 Handling Errors]
// วาง ExceptionMiddleware ไว้บนสุดเพื่อให้ครอบคลุม Middleware ทุกตัวใน Pipeline
app.UseMiddleware<ExceptionMiddleware>(); 

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// ==================================================================================
// 3. DATA INITIALIZATION
// ==================================================================================

// [บทที่ 2: Elements of High-Quality Programs - Section 2.3 Modularization] 
// การแยก Logic การเริ่มต้นข้อมูลออกมาเพื่อให้ Mainline Code อ่านง่ายและ Lean
SeedDatabase(app);

app.Run();

// [บทที่ 9: Advanced Modularization Techniques] - การสร้างโมดูลย่อยเพื่อจัดการงานเฉพาะทาง (Seeding)
void SeedDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AssetDbContext>();

    //
    // [บทที่ 4: Smart Table Design] - การจัดการข้อมูลเบื้องต้นโดยคำนึงถึงความสมบูรณ์ของข้อมูล (Data Integrity)
    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new Category { Name = "Electronics" },
            new Category { Name = "Furniture" },
            new Category { Name = "Vehicles" }
        );
        // [บทที่ 12.4: Saving Data] - ยืนยันการบันทึกสถานะลงใน Database จริง
        db.SaveChanges(); 
    }

    if (!db.Assets.Any())
    {
        // [บทที่ 7: Multi-table Database Design] - การจัดการความสัมพันธ์ของ Foreign Key (CategoryId) ให้ถูกต้อง
        db.Assets.AddRange(
            new Asset { Name = "Laptop", Description = "Dell XPS 13", Model = "XPS 13", Value = 1200.00m, CategoryId = 1 },
            new Asset { Name = "Chair", Description = "Office chair", Model = "Ergonomic", Value = 150.00m, CategoryId = 2 },
            new Asset { Name = "Car", Description = "Toyota Corolla", Model = "Corolla", Value = 15000.00m, CategoryId = 3 }
        );
        db.SaveChanges();
    }
}