import { Routes } from '@angular/router';
import { AssetList } from './asset-list/asset-list';
import { AssetFormComponent } from './asset-form/asset-form';

// ==================================================================================
// CONFIGURING APPLICATION ROUTES
// ==================================================================================

//
// [บทที่ 2: Elements of High-Quality Programs - Section 2.1: Declaring and Initializing Variables and Constants]
// การกำหนดค่าคงที่สำหรับเส้นทาง (Routes) เพื่อความสม่ำเสมอและลดความซ้ำซ้อนของข้อมูล
export const routes: Routes = [
  
  //
  // [บทที่ 2: Section 2.3: Modularization] - การจัดแบ่งโปรแกรมออกเป็นโมดูลย่อยๆ เพื่อให้อ่านง่ายและจัดการได้ดี
  { 
    path: 'assets', 
    component: AssetList 
  },

  //
  // [บทที่ 5: MVP and Experiments - Section: Outcomes Over Output]
  // ออกแบบเส้นทางที่มุ่งเน้นไปยังผลลัพธ์ที่ผู้ใช้ต้องการทำสำเร็จ (เช่น การเพิ่มสินทรัพย์ใหม่) เพื่อลดความซับซ้อน
  { 
    path: 'assets/add', 
    component: AssetFormComponent 
  },

  //
  // [บทที่ 7: Multi-table Database Design - Section: Foreign Keys and Relationships]
  // การใช้พารามิเตอร์ :id (เสมือน Primary Key ใน SQL) เพื่อระบุและเข้าถึงข้อมูลเฉพาะรายการได้อย่างถูกต้อง
  { 
    path: 'assets/edit/:id', 
    component: AssetFormComponent 
  },

  //
  // [บทที่ 2: Section: Avoiding Confusion] - การสร้างระบบนำทางที่คาดเดาได้ (Predictable Navigation)
  { 
    path: '', 
    redirectTo: '/assets', 
    pathMatch: 'full' 
  },

  //
  // [บทที่ 5: Making Decisions] - การจัดการกรณีที่ผู้ใช้ระบุเส้นทางไม่ถูกต้อง (Wildcard Route) เพื่อป้องกันข้อผิดพลาดของโปรแกรม
  { 
    path: '**', 
    redirectTo: '/assets' 
  }
];