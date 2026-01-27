import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; //
import { AssetService, Category, Asset } from '../asset.service';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectModule, InputTextModule, InputNumberModule, ButtonModule],
  templateUrl: './asset-form.html' //
})
export class AssetFormComponent implements OnInit {
  // ==================================================================================
  // 1. DEPENDENCY INJECTION
  // ==================================================================================
  
  // [บทที่ 10: Dependency Injection] - การฉีด ActivatedRoute เพื่อเข้าถึง ID จาก URL
  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  private router = inject(Router);
  private route = inject(ActivatedRoute); 

  categories: Category[] = [];
  isEditMode = false; //
  assetId?: number;

  assetForm = this.fb.group({
    id: [0], // เก็บ ID สำหรับการ Update
    name: ['', [Validators.required, Validators.minLength(3)]],
    model: ['', Validators.required],
    description: [''],
    categoryId: [null as number | null, Validators.required], //
    value: [0, [Validators.required, Validators.min(0)]]
  });

  // ==================================================================================
  // 2. LIFECYCLE & MODULAR LOGIC
  // ==================================================================================

  ngOnInit() {
    // โหลด Categories สำหรับ Dropdown เสมอ
    this.assetService.getCategories().subscribe(data => this.categories = data);

    // [บทที่ 5: Making Decisions] - ตรวจสอบว่ามี ID ใน URL หรือไม่เพื่อเข้าสู่โหมดแก้ไข
    this.assetId = Number(this.route.snapshot.params['id']);
    if (this.assetId) {
      this.isEditMode = true;
      this.loadAssetForEdit(this.assetId); //
    }
  }

  // แยก Logic การดึงข้อมูลเก่ามาใส่ฟอร์ม (Patch Value)
  private loadAssetForEdit(id: number) {
    this.assetService.getAsset(id).subscribe((asset: Asset) => {
      this.assetForm.patchValue(asset as any);
    });
  }

  onSubmit() {
    if (this.assetForm.invalid) return;

    // [บทที่ 5: Decision Making] - เลือกว่าจะส่งคำสั่ง Update หรือ Create
    const request = this.isEditMode
      ? this.assetService.updateAsset(this.assetId!, this.assetForm.value as any)
      : this.assetService.createAsset(this.assetForm.value as any);

    request.subscribe({
      // - พาผู้ใช้กลับไปหน้าหลักเมื่อสำเร็จ
      next: () => this.router.navigate(['/assets']),
      error: (err: any) => console.error('Operation failed', err)
    });
  }

  onCancel(): void {
    this.router.navigate(['/assets']);
  }
}