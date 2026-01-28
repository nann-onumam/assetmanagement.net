Asset Management System (Internal Tool)
🧠 Logic & Architecture
โปรเจกต์นี้แยกส่วนการทำงานชัดเจนตามหลัก 
**Separation of Concerns**:
 - Backend: สถาปัตยกรรม REST API บน .NET 8 เน้นความเร็วและ Middleware ที่จัดการ Exception แบบ Global
 - Frontend: Angular 21 (Latest) ร่วมกับ PrimeNG เพื่อสร้าง UI ที่เป็น State-driven และ Responsive
 - Database: SQLite สำหรับ Lightweight implementation พร้อมระบบ Migration ที่ควบคุม Version ของ Schema ได้ 100%

📂 System Components
⚙️ Backend (The Core)
 - Framework: ASP.NET Core 8
 - ORM: Entity Framework Core 8 (Code First Approach)
 - API Documentation: Swagger/OpenAPI (เข้าถึงได้ที่ "/swagger")
 - Safety: รองรับ CORS Policy และมี Validation Logic ทั้งในระดับ Model และ Database

🎨 Frontend (The Interface)
 - Framework: Angular 21 + TypeScript 5.9
 - UI Library: PrimeNG 21 (Professional Component Suite)
 - Styling: Tailwind CSS (Utility-first logic)
 - State Management: RxJS Observables สำหรับจัดการ Async Data Flow

🚀 Execution Guide (Step-by-Step)
1. Database Initialization (Bash)
"cd AssetApi
dotnet ef database update"

 - Tech Note: คำสั่งนี้จะทำการสร้าง "AssetManagement.db" และ Execute Seed Logic เพื่อเตรียม Category พื้นฐาน (Electronics, Furniture, Vehicles) ให้พร้อมใช้งานทันที

2. Services Startup
 - Backend: "dotnet run" (Default at "http://localhost:5000")
 - Frontend: "npm install" แล้วตามด้วย "ng serve" (Default at "http://localhost:4200")
---

📡 API Schema Summary
"/api/assets" GET Fetch All (Include Category Object)
"/api/assets" POST Create (Validated Input)
"/api/assets/{id}" PUT Update (Partial/Full Update)
"/api/assets/{id}" DELETE Remove (Cascade Restricted)
---

🛡 Security & Validation Rules
 - Data Integrity: มีการใช้ "OnDelete.Restrict" เพื่อป้องกันการลบ Category ที่ยังมี Asset ผูกอยู่ (Prevent Orphan Records)
 - Input Validation: กำหนดกฎชัดเจน เช่น Asset Name (3-100 chars), Value (Non-negative)
 - Async Operations: ทุก Database Call ใช้ "Task<T>" เพื่อป้องกัน Thread Blocking
