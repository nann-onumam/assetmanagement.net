using System.ComponentModel.DataAnnotations;

namespace AssetApi.Models;

public class Category 
{
    public int Id { get; init; } // ใช้ init ถ้าไม่อยากให้รหัสถูกเปลี่ยนภายหลัง

    [Required, StringLength(100)] // ยุบ Attribute มาไว้บรรทัดเดียวกันได้
    public required string Name { get; set; }

    public ICollection<Asset> Assets { get; } = new HashSet<Asset>(); 
    // ใช้ ICollection และ Initialize ค่าเริ่มต้นทันทีเพื่อกัน Null Reference
}

public class Asset 
{
    public int Id { get; init; }
    
    [Required, StringLength(100)]
    public required string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; }

    [Required, StringLength(50)]
    public required string Model { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Value { get; set; }
    
    public int CategoryId { get; set; } 
    public Category Category { get; set; } = null!; // ใช้ null! เพื่อบอก Compiler ว่าจะไม่มีค่า null แน่นอน (เพราะมี CategoryId)
}