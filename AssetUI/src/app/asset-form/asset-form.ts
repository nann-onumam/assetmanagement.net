import { Component, inject, OnInit, OnChanges, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AssetService } from '../asset.service';
import { Asset } from '../models/asset';
import { Category } from '../models/category';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.scss'
})
export class AssetFormComponent implements OnInit, OnChanges {
  @Input() visible = false;
  @Input() editingAsset: Asset | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() assetSaved = new EventEmitter<Asset>();

  private fb = inject(FormBuilder);
  private assetService = inject(AssetService);
  private messageService = inject(MessageService);

  categories: Category[] = [];
  isEditMode = false;
  isSubmitting = false;
  form!: FormGroup;

  assetForm: FormGroup = this.fb.group({
    id: [null],
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    model: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(500)]],
    categoryId: [null, Validators.required],
    value: [0, [Validators.required, Validators.min(0)]]
  });

  closeModal(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
  }

  onBackdropClick(): void {
    this.closeModal();
  }

  ngOnInit(): void {
    this.loadCategories();
    
    // If editingAsset is provided, populate the form
    if (this.editingAsset) {
      this.isEditMode = true;
      this.populateFormWithAsset(this.editingAsset);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editingAsset'] && changes['editingAsset'].currentValue) {
      this.isEditMode = true;
      this.populateFormWithAsset(changes['editingAsset'].currentValue);
    } else if (changes['editingAsset'] && !changes['editingAsset'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  loadCategories(): void {
    this.assetService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Error loading categories', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories'
        });
      }
    });
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

  resetForm(): void {
    this.assetForm.reset({
      id: null,
      name: '',
      model: '',
      description: '',
      categoryId: null,
      value: 0
    });
    this.assetForm.markAsPristine();
    this.assetForm.markAsUntouched();
  }

  onDialogHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.resetForm();
    this.editingAsset = null;
  }

  onSubmit(): void {
    console.log('Form validity:', this.assetForm.valid);
    console.log('Form errors:', this.assetForm.errors);
    
    // Log each field's validity
    Object.keys(this.assetForm.controls).forEach(key => {
      const control = this.assetForm.get(key);
      console.log(`Field ${key}:`, {
        valid: control?.valid,
        errors: control?.errors,
        value: control?.value,
        touched: control?.touched,
        dirty: control?.dirty
      });
    });

    if (this.assetForm.invalid) {
      console.warn('Form is invalid, showing validation error message');
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assetForm.value;
    
    // Explicitly cast numeric values to ensure .NET type compatibility
    const payload = {
      ...formValue,
      categoryId: Number(formValue.categoryId),
      value: Number(formValue.value)
    };
    
    console.log('Payload being sent to API:', payload);

    if (this.isEditMode && payload.id) {
      // Update existing asset
      this.assetService.updateAsset(payload.id, payload).subscribe({
        next: (updatedAsset) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset updated successfully'
          });
          this.assetSaved.emit(updatedAsset);
          this.onDialogHide();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error updating asset', err);
          
          // Extract and log validation errors from backend
          if (err.error && err.error.errors) {
            console.log('Validation errors:', err.error.errors);
            const errorMessages = Object.entries(err.error.errors)
              .map(([field, messages]: [string, any]) => 
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
              )
              .join('\n');
            
            this.messageService.add({
              severity: 'error',
              summary: 'Validation Error',
              detail: errorMessages,
              sticky: true
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update asset'
            });
          }
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new asset - remove ID before sending
      const { id, ...assetData } = payload;
      console.log('Creating asset with data:', assetData);
      this.assetService.createAsset(assetData).subscribe({
        next: (createdAsset) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Asset created successfully'
          });
          this.assetSaved.emit(createdAsset);
          this.onDialogHide();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error creating asset', err);
          
          // Extract and log validation errors from backend
          if (err.error && err.error.errors) {
            console.log('Validation errors:', err.error.errors);
            const errorMessages = Object.entries(err.error.errors)
              .map(([field, messages]: [string, any]) => 
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
              )
              .join('\n');
            
            this.messageService.add({
              severity: 'error',
              summary: 'Validation Error',
              detail: errorMessages,
              sticky: true
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create asset'
            });
          }
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.onDialogHide();
  }

  // Validation helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.assetForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.assetForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${this.getTitleCase(fieldName)} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.getTitleCase(fieldName)} must be at least ${minLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${this.getTitleCase(fieldName)} cannot exceed ${maxLength} characters`;
    }
    if (field.hasError('min')) {
      return `${this.getTitleCase(fieldName)} must be greater than or equal to ${field.errors['min'].min}`;
    }
    return 'Invalid field';
  }

  private getTitleCase(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  }
}