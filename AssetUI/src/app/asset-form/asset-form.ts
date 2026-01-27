import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetService, Category } from '../asset.service';
import { SelectModule } from 'primeng/select'; // PrimeNG 18+ (p-select)
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, InputTextModule, InputNumberModule, TextareaModule, ButtonModule],
  templateUrl: './asset-form.html' // แยก Template เพื่อความเป็นระเบียบ
})
export class AssetFormComponent implements OnInit {
  // ==================================================================================
  // 1. DEPENDENCY INJECTION (DI)
  // ==================================================================================
  
  // [บทที่ 10: Dependency Injection] - การใช้ inject() เพื่อดึง Service มาใช้งาน 
  // ช่วยลด Boilerplate และทำให้โค้ดสะอาดขึ้นตามหลัก DI Container
  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  private router = inject(Router);

  categories: Category[] = [];

  // ==================================================================================
  // 2. DATA VALIDATION & STRUCTURE
  // ==================================================================================

  // [บทที่ 5: Making Decisions - Section 5.8 Validating Data] 
  // การกำหนดกฎการตรวจสอบข้อมูล (Validation) เพื่อป้องกัน Error ตั้งแต่ต้นทาง
  assetForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    model: ['', Validators.required],
    description: [''],
    // [Head First SQL, บทที่ 7: Multi-table Database Design]
    // การใช้ categoryId เพื่อเชื่อมโยงไปยัง Foreign Key ในฐานข้อมูล MySQL
    categoryId: [null, Validators.required],
    value: [0, [Validators.required, Validators.min(0)]]
  });

  // ==================================================================================
  // 3. MODULAR LOGIC & OUTCOMES
  // ==================================================================================

  // [Programming Logic and Design, บทที่ 9: Modularization Techniques]
  // การแยกตรรกะการโหลดข้อมูลเริ่มต้นออกจากส่วนอื่น (Initialization Module)
  ngOnInit() {
    this.assetService.getCategories().subscribe(data => this.categories = data);
  }

  onSubmit() {
    // [Programming Logic and Design, บทที่ 4: Making Decisions] - ตรวจสอบความถูกต้องก่อนส่งข้อมูล
    if (this.assetForm.valid) {
      this.assetService.createAsset(this.assetForm.value as any).subscribe({
        // [Lean UX, บทที่ 5: MVP and Experiments - Section: Outcomes Over Output]
        // การมุ่งเน้นที่ผลลัพธ์ (Outcome) คือการนำพาผู้ใช้ไปยังหน้าถัดไปเมื่อทำสำเร็จ
        next: () => this.router.navigate(['/assets']),
        error: (err) => console.error('Submission failed', err)
      });
    }
  }

  onCancel() {
    this.router.navigate(['/assets']);
  }
}