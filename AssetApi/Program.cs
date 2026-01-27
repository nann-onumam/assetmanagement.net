using Microsoft.EntityFrameworkCore;
using AssetApi.Data;
using AssetApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AssetDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AssetDbContext>();
    db.Database.EnsureCreated();

    // Seed data
    if (!db.Categories.Any())
    {
        db.Categories.AddRange(
            new Category { Name = "Electronics" },
            new Category { Name = "Furniture" },
            new Category { Name = "Vehicles" }
        );
        db.SaveChanges();
    }

    if (!db.Assets.Any())
    {
        db.Assets.AddRange(
            new Asset { Name = "Laptop", Description = "Dell XPS 13", Model = "XPS 13", Value = 1200.00m, CategoryId = 1 },
            new Asset { Name = "Chair", Description = "Office chair", Model = "Ergonomic", Value = 150.00m, CategoryId = 2 },
            new Asset { Name = "Car", Description = "Toyota Corolla", Model = "Corolla", Value = 15000.00m, CategoryId = 3 }
        );
        db.SaveChanges();
    }
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
