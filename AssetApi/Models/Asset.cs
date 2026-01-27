using System.ComponentModel.DataAnnotations;

namespace AssetApi.Models;

// ==================================================================================
// 1. CLASS DEFINITION & DATA INTEGRITY
// ==================================================================================

// [บทที่ 7: Multi-table Database Design] - การออกแบบตารางเพื่อรองรับความสัมพันธ์ One-to-Many 
public class Category 
{
    // [บทที่ 7: Primary Keys] - การกำหนด Key หลักเพื่อให้ข้อมูลในแต่ละ Row ไม่ซ้ำกัน
    public int Id { get; init; } 

    //
    // [บทที่ 6: Validation: monitoring and reporting on user input] - การใช้ DataAnnotations เพื่อดักจับข้อมูล
    [Required, StringLength(100)] 
    public required string Name { get; set; }

    //
    // [บทที่ 12: Object-Oriented Programming] - การสร้าง Collection เพื่อเก็บวัตถุที่มีความสัมพันธ์กัน
    public ICollection<Asset> Assets { get; } = new HashSet<Asset>(); 
}

public class Asset 
{
    //
    // [บทที่ 2: Elements of High-Quality Programs] - การตั้งชื่อตัวแปรที่สื่อความหมาย (Self-Documenting Code)
    public int Id { get; init; }
    
    [Required, StringLength(100)]
    public required string Name { get; set; }

    [StringLength(500)]
    public string? Description { get; set; } // [บทที่ 31: Optional Data] - การรองรับค่าว่าง (Nullable)

    [Required, StringLength(50)]
    public required string Model { get; set; }

    //
    // [บทที่ 6.2: Using DataAnnotation attributes] - การกำหนดขอบเขตข้อมูลด้วย [Range]
    [Range(0, double.MaxValue)]
    public decimal Value { get; set; }
    
    // ==============================================================================
    // 2. RELATIONSHIP MAPPING
    // ==============================================================================
    
    // [บทที่ 7: Foreign Keys] - การสร้างตัวเชื่อมโยงระหว่างสองตาราง
    public int CategoryId { get; set; } 

    //
    // [บทที่ 12.2: Defining the data model] - การสร้าง Navigation Property สำหรับ EF Core
    public Category Category { get; set; } = null!; 
}