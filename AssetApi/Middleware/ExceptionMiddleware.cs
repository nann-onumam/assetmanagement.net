using System.Net;
using System.Text.Json;

namespace AssetApi.Middleware;

// ==================================================================================
// 1. MIDDLEWARE STRUCTURE
// ==================================================================================

// [บทที่ 3: The Middleware Pipeline - Section 3.3 Creating error-handling middleware] 
// การสร้าง Middleware สำหรับดักจับ Exception ทั่วทั้ง Application
// ใช้ Primary Constructor (C# 12) เพื่อความ Lean และลด Boilerplate Code
public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // [บทที่ 3: The Middleware Pipeline - Section 3.1.2 The next delegate]
            // ส่งต่อ Context ไปยัง Middleware ตัวถัดไปในท่อ (Pipeline)
            await next(context); 
        }
        catch (Exception ex)
        {
            // ==============================================================================
            // 2. EXCEPTION HANDLING LOGIC
            // ==============================================================================

            // [บทที่ 13: Exception Handling - Section 13.3 The try, catch, and throw Way]
            // การจัดการกับข้อผิดพลาดที่ไม่ได้คาดคิด (Runtime Errors) เพื่อไม่ให้โปรแกรมหยุดทำงาน
            
            // [บทที่ 19: Logging and Monitoring - Section 19.1 Logging in ASP.NET Core]
            // บันทึก Log เมื่อเกิด Error เพื่อใช้วิเคราะห์ภายหลัง (Nerd Style)
            logger.LogError(ex, "An unhandled exception has occurred."); 
            
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        // [บทที่ 9: Creating a Web API - Section 9.2 Creating a Response]
        // กำหนดรูปแบบการตอบกลับให้เป็น JSON ตามมาตรฐาน Web API
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

        // [บทที่ 13: Exception Handling - Section 13.5 Handling Exceptions with Feedback]
        // การออกแบบข้อความแจ้งเตือนที่ช่วยให้ผู้ใช้ (หรือ Developer) รู้สถานะ
        var response = new 
        {
            StatusCode = context.Response.StatusCode,
            Message = "Internal Server Error. Please contact support.",
            // [Nerd Note] ในสภาพแวดล้อมจริง ควรใช้ env.IsDevelopment() เพื่อซ่อน Detail นี้ใน Production
            Detail = exception.Message 
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}