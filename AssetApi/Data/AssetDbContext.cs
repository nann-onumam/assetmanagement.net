using Microsoft.EntityFrameworkCore;
using AssetApi.Models;

namespace AssetApi.Data;

// ==================================================================================
// 1. DATABASE CONTEXT CONFIGURATION
// ==================================================================================

// [บทที่ 12: Interacting with a database using EF Core - Section 12.2.2 Creating a DbContext]
// DbContext คือหัวใจสำคัญในการจัดการ Sessions กับฐานข้อมูล
public class AssetDbContext : DbContext
{
    public AssetDbContext(DbContextOptions<AssetDbContext> options) : base(options)
    {
    }

    // [บทที่ 12.2.1 Defining the data model] - การใช้ DbSet เพื่อแทนค่าตารางใน Database
    // [Programming Logic and Design, บทที่ 2: Elements of High-Quality Programs] - ตั้งชื่อให้สื่อความหมาย (Plural naming)
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Asset> Assets => Set<Asset>();

    // ==================================================================================
    // 2. MODEL MAPPING & RELATIONSHIPS
    // ==================================================================================

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // [ASP.NET Core in Action, บทที่ 12.3: Mapping a model to a database]
        // การใช้ Fluent API เพื่อควบคุมคุณลักษณะของ Schema ได้ละเอียดกว่า DataAnnotations
        base.OnModelCreating(modelBuilder);

        // [Head First SQL, บทที่ 7: Multi-table Database Design - Section: Foreign Keys]
        // การกำหนดความสัมพันธ์ One-to-Many เพื่อรักษาความสมบูรณ์ของข้อมูล (Referential Integrity)
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Category)
            .WithMany(c => c.Assets)
            .HasForeignKey(a => a.CategoryId)
            // [Head First SQL, บทที่ 7: Deleting data with relationships]
            // Restrict: ป้องกันข้อมูลกำพร้า (Orphaned Data) โดยห้ามลบ Category หากยังมี Asset ผูกอยู่
            .OnDelete(DeleteBehavior.Restrict); 
    }
}