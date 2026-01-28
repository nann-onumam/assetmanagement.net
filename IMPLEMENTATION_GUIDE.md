# Asset Management System - Action Implementation Guide

## Overview
This document provides a comprehensive guide for implementing View, Update, and Delete actions in the Asset Management System using Angular and .NET Web API.

---

## 1. UPDATE ACTION (Reactive Form in Material Dialog)

### Key Features
- ✅ Uses Angular Material Dialog for modal presentation
- ✅ Reactive Form with validation
- ✅ Pre-populates form with existing asset data using `patchValue()`
- ✅ PUT request to backend API
- ✅ Real-time form updates

### Implementation Steps

#### 1.1 Asset List Component (asset-list.ts)
```typescript
import { MatDialog } from '@angular/material/dialog';

export class AssetList implements OnInit {
  private dialog = inject(MatDialog);

  editAsset(asset: Asset): void {
    // Open Material Dialog with asset form
    const dialogRef = this.dialog.open(AssetFormComponent, {
      width: '600px',
      data: { asset, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.id === asset.id) {
        // Update asset in list
        const index = this.assets.findIndex(a => a.id === asset.id);
        if (index !== -1) {
          this.assets[index] = { ...this.assets[index], ...result };
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Asset updated successfully'
        });
      }
    });
  }
}
```

#### 1.2 Asset Form Component (asset-form.ts)
```typescript
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class AssetFormComponent implements OnInit {
  @Optional() private dialogRef = inject(MatDialogRef<AssetFormComponent>, { optional: true });
  @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any = null;

  ngOnInit(): void {
    this.loadCategories();
    
    // If opened via Material Dialog, extract asset data
    if (this.dialogData && this.dialogData.asset) {
      this.editingAsset = this.dialogData.asset;
      this.isEditMode = this.dialogData.isEditMode || false;
      this.populateFormWithAsset(this.editingAsset);
    }
  }

  populateFormWithAsset(asset: Asset): void {
    this.assetForm.patchValue({
      id: asset.id || 0,
      name: asset.name,
      model: asset.model,
      description: asset.description || '',
      categoryId: asset.categoryId,
      value: asset.value
    });
  }

  onSubmit(): void {
    if (!this.assetForm.valid) return;

    const formValue = this.assetForm.value;
    this.isSubmitting = true;

    if (this.isEditMode) {
      this.assetService.updateAsset(formValue.id, formValue).subscribe({
        next: (updatedAsset) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset updated successfully'
          });
          
          // Close dialog and return updated asset
          if (this.dialogRef) {
            this.dialogRef.close(updatedAsset);
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error updating asset', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update asset'
          });
          this.isSubmitting = false;
        }
      });
    }
  }
}
```

#### 1.3 Asset Service (asset.service.ts)
```typescript
@Injectable({ providedIn: 'root' })
export class AssetService {
  private baseApiUrl = 'http://localhost:5000/api';

  updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.put<Asset>(`${this.baseApiUrl}/assets/${id}`, asset);
  }
}
```

---

## 2. VIEW ACTION (Router Navigation)

### Key Features
- ✅ Navigate to `/assets/profile/:id` using Angular Router
- ✅ Display detailed asset information
- ✅ Call `getAsset(id)` API to fetch single asset
- ✅ Back button to return to list

### Implementation Steps

#### 2.1 Asset List Component (asset-list.ts)
```typescript
import { Router } from '@angular/router';

export class AssetList implements OnInit {
  private router = inject(Router);

  viewAsset(asset: Asset): void {
    if (asset.id) {
      this.router.navigate(['/assets/profile', asset.id]);
    }
  }
}
```

#### 2.2 Asset Profile Component (asset-profile.ts)
```typescript
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-asset-profile',
  standalone: true,
  // ... templates and imports
})
export class AssetProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private assetService = inject(AssetService);
  
  asset: Asset | null = null;
  loading = false;

  ngOnInit(): void {
    // Read id from route parameters
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadAsset(id);
      }
    });
  }

  loadAsset(id: number): void {
    this.loading = true;
    this.assetService.getAsset(id).subscribe({
      next: (data) => {
        this.asset = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading asset', err);
        this.loading = false;
      }
    });
  }
}
```

#### 2.3 Asset Service (asset.service.ts)
```typescript
@Injectable({ providedIn: 'root' })
export class AssetService {
  getAsset(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.baseApiUrl}/assets/${id}`);
  }
}
```

#### 2.4 Route Configuration (app.routes.ts)
```typescript
export const routes: Routes = [
  {
    path: 'assets',
    component: AssetList
  },
  {
    path: 'assets/profile/:id',
    component: AssetProfileComponent
  }
];
```

---

## 3. DELETE ACTION (Confirmation Dialog)

### Key Features
- ✅ PrimeNG Confirmation Dialog for user confirmation
- ✅ DELETE API request on confirmation
- ✅ Refresh observable data stream after deletion
- ✅ Success/error messaging

### Implementation Steps

#### 3.1 Asset List Component (asset-list.ts)
```typescript
import { ConfirmationService } from 'primeng/api';

export class AssetList implements OnInit {
  private confirmationService = inject(ConfirmationService);

  deleteAsset(asset: Asset): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (asset.id) {
          this.loading = true;
          this.assetService.deleteAsset(asset.id).subscribe({
            next: () => {
              // Refresh the observable data stream
              this.loadAssets();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Asset "${asset.name}" deleted successfully`
              });
            },
            error: (err) => {
              this.loading = false;
              console.error('Error deleting asset', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete asset. Please try again.'
              });
            }
          });
        }
      }
    });
  }

  loadAssets(): void {
    this.loading = true;
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data.map(asset => ({
          ...asset,
          status: this.getRandomStatus()
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading assets', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load assets'
        });
      }
    });
  }
}
```

#### 3.2 Asset Service (asset.service.ts)
```typescript
@Injectable({ providedIn: 'root' })
export class AssetService {
  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseApiUrl}/assets/${id}`);
  }
}
```

#### 3.3 HTML Template (asset-list.html)
```html
<p-toast></p-toast>
<p-confirmDialog></p-confirmDialog>

<!-- Action buttons in table -->
<p-splitButton
  label="Actions"
  icon="pi pi-cog"
  [model]="getActionItems(asset)"
  (onClick)="viewAsset(asset)"
  [rounded]="true"
  severity="secondary">
</p-splitButton>
```

---

## 4. REQUIRED SETUP

### 4.1 Install Material Dialog (if not already installed)
```bash
ng add @angular/material
```

### 4.2 Update Main Configuration (main.ts)
```typescript
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    // ... other providers
  ]
});
```

### 4.3 Module Imports in Components
Ensure these are imported in components:
- `MatDialog` for Material Dialog
- `ConfirmationService` for PrimeNG Confirmation
- `Router, ActivatedRoute` for routing
- `ReactiveFormsModule` for reactive forms

---

## 5. DATA FLOW DIAGRAM

### Update Flow
```
Asset List Component
    ↓
User clicks "Edit"
    ↓
Opens Material Dialog with AssetFormComponent
    ↓
Form pre-populates with patchValue()
    ↓
User submits form
    ↓
AssetService.updateAsset() → PUT /api/assets/{id}
    ↓
Dialog closes with updated data
    ↓
Asset List updates in UI
```

### View Flow
```
Asset List Component
    ↓
User clicks "View"
    ↓
Router navigates to /assets/profile/:id
    ↓
AssetProfileComponent initializes
    ↓
AssetService.getAsset(id) → GET /api/assets/{id}
    ↓
Display asset details
```

### Delete Flow
```
Asset List Component
    ↓
User clicks "Delete"
    ↓
Confirmation Dialog appears
    ↓
User confirms deletion
    ↓
AssetService.deleteAsset(id) → DELETE /api/assets/{id}
    ↓
loadAssets() refreshes observable stream
    ↓
Asset List updates in UI
```

---

## 6. VALIDATION & ERROR HANDLING

### Form Validation (Reactive Form)
```typescript
assetForm: FormGroup = this.fb.group({
  id: [0],
  name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  model: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  description: ['', [Validators.maxLength(500)]],
  categoryId: [null, Validators.required],
  value: [0, [Validators.required, Validators.min(0)]]
});
```

### API Error Handling
```typescript
error: (err) => {
  console.error('Error updating asset', err);
  this.messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Failed to update asset'
  });
  this.isSubmitting = false;
}
```

---

## 7. TESTING CHECKLIST

- [ ] View: Navigate to asset profile and display correct details
- [ ] View: Back button returns to asset list
- [ ] Update: Open dialog with pre-filled form data
- [ ] Update: Form validation prevents submission of invalid data
- [ ] Update: PUT request sent with correct data
- [ ] Update: Dialog closes and list updates after success
- [ ] Delete: Confirmation dialog appears
- [ ] Delete: Can cancel deletion
- [ ] Delete: DELETE request sent on confirmation
- [ ] Delete: List refreshes after successful deletion
- [ ] Error handling: Show error messages for failed requests

---

## 8. BEST PRACTICES

1. **Reactive Forms**: Use `FormBuilder` and `FormGroup` for complex forms
2. **Type Safety**: Use TypeScript interfaces for Asset and Category
3. **Observable Streams**: Use RxJS operators for efficient data handling
4. **Error Handling**: Always handle errors in subscriptions
5. **Loading States**: Show loading indicators during async operations
6. **User Feedback**: Display toast messages for all actions
7. **Confirmation**: Always confirm destructive actions (delete)
8. **Navigation**: Use typed routing with route parameters

---

## 9. RELATED CONCEPTS

Based on referenced textbooks:
- **บทที่ 10: Dependency Injection** - Service injection pattern
- **บทที่ 9: Creating Web Components** - Component composition and routing
- **บทที่ 12: Reactive Programming** - Observable streams and RxJS
- **Programming Logic & Design** - Form validation and error handling

