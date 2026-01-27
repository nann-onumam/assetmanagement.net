using Microsoft.EntityFrameworkCore;
using AssetApi.Models;

namespace AssetApi.Data;

public class AssetDbContext : DbContext
{
    public AssetDbContext(DbContextOptions<AssetDbContext> options) : base(options) { }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Asset> Assets { get; set; }
}