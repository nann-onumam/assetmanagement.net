import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from './models/asset';
import { Category } from './models/category';

// ==================================================================================
// ASSET MANAGEMENT SERVICE
// ==================================================================================
// Provides CRUD operations for assets and categories.
// Handles HTTP communication with the .NET backend API.

// ==================================================================================
// SERVICE IMPLEMENTATION
// ==================================================================================
// 2. SERVICE DECORATOR & DI
// ==================================================================================

// [บทที่ 10: Configured with Dependency Injection] - แม้เป็น Angular แต่ใช้หลักการ DI เดียวกับ .NET 
// เพื่อให้คลาสอื่นเรียกใช้งาน Service นี้ได้โดยไม่ต้องสร้าง Object เอง
@Injectable({ providedIn: 'root' })
export class AssetService {
  private baseApiUrl = 'http://localhost:5000/api'; // [บทที่ 2: Elements of High-Quality Programs] - ใช้ตัวแปรเก็บค่าคงที่

  // [บทที่ 10.2.1 Constructor injection] - ฉีด HttpClient เข้ามาเพื่อใช้รับ-ส่งข้อมูลกับ Server
  constructor(private http: HttpClient) {}

  // ==============================================================================
  // 3. API METHODS (MODULAR LOGIC)
  // ==============================================================================

  // [Programming Logic and Design - บทที่ 9: Modularization Techniques]
  // แยกส่วนการดึงข้อมูลหมวดหมู่ (Categories) เพื่อนำไปใช้กับ p-dropdown
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseApiUrl}/categories`);
  }

  // [Lean UX - บทที่ 5: MVP and Experiments] 
  // การสร้างฟังก์ชันพื้นฐานที่จำเป็นเพื่อให้ระบบทำงานได้ตามความต้องการของผู้ใช้ (Outcome-based)
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.baseApiUrl}/assets`);
  }

  createAsset(asset: Omit<Asset, 'id'>): Observable<Asset> {
    return this.http.post<Asset>(`${this.baseApiUrl}/assets`, asset);
  }

  getAsset(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.baseApiUrl}/assets/${id}`);
  }

  updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.put<Asset>(`${this.baseApiUrl}/assets/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/assets/${id}`);
  }

  // ... (Delete/Update Methods คงเดิมตามหลัก CRUD ใน ASP.NET Core in Action บทที่ 12)
}