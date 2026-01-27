using Microsoft.EntityFrameworkCore;
using AssetApi.Models;

namespace AssetApi.Data;

public class AssetDbContext : DbContext
{
    public AssetDbContext(DbContextOptions<AssetDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Asset> Assets { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // กำหนดความสัมพันธ์ให้ชัดเจน (ตามหลัก Head First SQL)
        modelBuilder.Entity<Asset>()
            .HasOne(a => a.Category)
            .WithMany(c => c.Assets)
            .HasForeignKey(a => a.CategoryId)
            .OnDelete(DeleteBehavior.Restrict); // ป้องกันข้อมูลกำพร้า (Orphaned Data)
    }
}