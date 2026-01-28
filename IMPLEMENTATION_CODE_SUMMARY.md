# Asset Management System - Complete Implementation Code

## FILES MODIFIED/CREATED

### 1. Asset List Component (asset-list.ts)
**Location**: `src/app/asset-list/asset-list.ts`

**Key Additions**:
- Import `Router` and `MatDialog`
- Inject Router and MatDialog services
- Update `viewAsset()` to navigate to `/assets/profile/:id`
- Update `editAsset()` to open Material Dialog
- Update `deleteAsset()` to refresh data stream after deletion

**Code Snippet**:
```typescript
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

export class AssetList implements OnInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);

  viewAsset(asset: Asset): void {
    if (asset.id) {
      this.router.navigate(['/assets/profile', asset.id]);
    }
  }

  editAsset(asset: Asset): void {
    const dialogRef = this.dialog.open(AssetFormComponent, {
      width: '600px',
      data: { asset, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.id === asset.id) {
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

  deleteAsset(asset: Asset): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${asset.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (asset.id) {
          this.loading = true;
          this.assetService.deleteAsset(asset.id).subscribe({
            next: () => {
              this.loadAssets();
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Asset "${asset.name}" deleted successfully`
              });
            },
            error: (err) => {
              this.loading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete asset'
              });
            }
          });
        }
      }
    });
  }
}
```

---

### 2. Asset Form Component (asset-form.ts)
**Location**: `src/app/asset-form/asset-form.ts`

**Key Additions**:
- Import `MatDialogRef` and `MAT_DIALOG_DATA`
- Inject dialog reference and data
- Update `ngOnInit()` to handle dialog data
- Update form submission to close dialog with updated asset

**Code Snippet**:
```typescript
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export class AssetFormComponent implements OnInit {
  @Optional() private dialogRef = inject(MatDialogRef<AssetFormComponent>, { optional: true });
  @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: any = null;

  ngOnInit(): void {
    this.loadCategories();
    
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
          
          if (this.dialogRef) {
            this.dialogRef.close(updatedAsset);
          }
          this.isSubmitting = false;
        },
        error: (err) => {
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

---

### 3. Asset Profile Component (NEW)
**Location**: `src/app/asset-profile/asset-profile.ts`

**Purpose**: Display detailed view of a single asset

**Code Snippet**:
```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../asset.service';
import { Asset } from '../models/asset';

@Component({
  selector: 'app-asset-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule],
  template: `
    <div class="surface-section px-4 py-4">
      <h1 class="text-3xl font-bold">Asset Profile</h1>
      
      <p-progressSpinner *ngIf="loading"></p-progressSpinner>

      <div *ngIf="!loading && asset" class="grid">
        <p-card>
          <h2>{{ asset.name }}</h2>
          <p>Model: {{ asset.model }}</p>
          <p>Category: {{ asset.category?.name }}</p>
          <p>Value: {{ asset.value | currency }}</p>
          <p>Description: {{ asset.description }}</p>
        </p-card>
      </div>
    </div>
  `
})
export class AssetProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private assetService = inject(AssetService);
  
  asset: Asset | null = null;
  loading = false;

  ngOnInit(): void {
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

---

### 4. Asset Service (asset.service.ts)
**Location**: `src/app/asset.service.ts`

**Key Methods** (already implemented):
```typescript
getAsset(id: number): Observable<Asset> {
  return this.http.get<Asset>(`${this.baseApiUrl}/assets/${id}`);
}

updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
  return this.http.put<Asset>(`${this.baseApiUrl}/assets/${id}`, asset);
}

deleteAsset(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseApiUrl}/assets/${id}`);
}
```

---

### 5. Routing Configuration (app.routes.ts)
**Location**: `src/app/app.routes.ts`

**Add These Routes**:
```typescript
import { AssetProfileComponent } from './asset-profile/asset-profile';

export const routes: Routes = [
  {
    path: 'assets',
    component: AssetList
  },
  {
    path: 'assets/profile/:id',
    component: AssetProfileComponent
  },
  {
    path: '',
    redirectTo: '/assets',
    pathMatch: 'full'
  }
];
```

---

### 6. Main Configuration (main.ts)
**Location**: `src/main.ts`

**Ensure These Providers Are Included**:
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

---

## REACTIVE FORM VALIDATION

The asset form uses Reactive Forms with the following validation rules:

```typescript
assetForm: FormGroup = this.fb.group({
  id: [0],
  name: [
    '', 
    [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ]
  ],
  model: [
    '', 
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]
  ],
  description: [
    '', 
    [Validators.maxLength(500)]
  ],
  categoryId: [
    null, 
    Validators.required
  ],
  value: [
    0, 
    [
      Validators.required,
      Validators.min(0)
    ]
  ]
});
```

---

## ACTION MENU ITEMS

The split button actions in the asset table:

```typescript
getActionItems(asset: Asset): MenuItem[] {
  return [
    {
      label: 'View',
      icon: 'pi pi-eye',
      command: () => this.viewAsset(asset)
    },
    {
      label: 'Update',
      icon: 'pi pi-pencil',
      command: () => this.editAsset(asset)
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.deleteAsset(asset)
    }
  ];
}
```

---

## CONFIRMATION DIALOG CONFIGURATION

Delete confirmation dialog:

```typescript
this.confirmationService.confirm({
  message: `Are you sure you want to delete "${asset.name}"? This action cannot be undone.`,
  header: 'Confirm Delete',
  icon: 'pi pi-exclamation-triangle',
  accept: () => {
    // Handle deletion
  },
  reject: () => {
    // User cancelled
  }
});
```

---

## MATERIAL DIALOG CONFIGURATION

Edit dialog:

```typescript
const dialogRef = this.dialog.open(AssetFormComponent, {
  width: '600px',
  maxHeight: '90vh',
  data: { 
    asset,
    isEditMode: true
  },
  panelClass: 'asset-dialog'
});

dialogRef.afterClosed().subscribe((result) => {
  if (result) {
    // Handle result
  }
});
```

---

## CSS STYLES FOR ASSET PROFILE

**Optional styling** (asset-profile.scss):

```scss
:host {
  ::ng-deep {
    .asset-card {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }

    .asset-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px 8px 0 0;
    }

    .asset-detail {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      padding: 2rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .detail-item {
      label {
        font-weight: 600;
        color: #495057;
        margin-bottom: 0.5rem;
        display: block;
      }

      span {
        color: #212529;
        font-size: 1rem;
      }
    }
  }
}
```

---

## MATERIAL INSTALLATION

If Material is not installed:

```bash
ng add @angular/material

# Select theme (choose one):
# Indigo/Pink
# Deep Purple/Amber
# Purple/Green
# Blue Grey/Orange

# Choose typography: Yes
# Choose animations: Yes
```

---

## NPM DEPENDENCIES NEEDED

Ensure your `package.json` includes:

```json
{
  "dependencies": {
    "@angular/material": "^17.x.x",
    "@angular/animations": "^17.x.x",
    "primeng": "^17.x.x",
    "primeicons": "^6.x.x"
  }
}
```

---

## TESTING THE IMPLEMENTATION

### Test View Action
1. Navigate to http://localhost:4200/assets
2. Click "View" button on any asset
3. Should navigate to `/assets/profile/[id]`
4. Verify asset details load correctly

### Test Update Action
1. Navigate to http://localhost:4200/assets
2. Click "Update" button on any asset
3. Material Dialog should open
4. Form should be pre-filled with asset data
5. Modify any field and submit
6. Should see success message
7. List should update with new data

### Test Delete Action
1. Navigate to http://localhost:4200/assets
2. Click "Delete" button on any asset
3. Confirmation dialog should appear
4. Click "Yes" to confirm
5. Should see success message
6. Asset should be removed from list

---

## TROUBLESHOOTING

### Issue: Dialog doesn't open
**Solution**: Ensure `provideAnimations()` is in main.ts

### Issue: Form doesn't pre-populate
**Solution**: Check that `ngOnInit()` handles `dialogData` correctly

### Issue: Delete doesn't refresh list
**Solution**: Ensure `loadAssets()` is called in the delete success callback

### Issue: Navigation doesn't work
**Solution**: Verify routes are configured in `app.routes.ts`

---

## NEXT STEPS

1. Install Angular Material: `ng add @angular/material`
2. Create AssetProfileComponent
3. Update routing configuration
4. Test all three actions
5. Add additional validation as needed
6. Implement advanced features (filtering, sorting, pagination)

