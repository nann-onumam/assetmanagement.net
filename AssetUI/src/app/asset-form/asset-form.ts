import { Component, inject, OnInit, OnChanges, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AssetService } from '../asset.service';
import { Asset } from '../models/asset';
import { Category } from '../models/category';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-asset-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
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

  assetForm: FormGroup = this.fb.group({
    id: [0],
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    model: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(500)]],
    categoryId: [null, Validators.required],
    value: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadCategories();
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
      id: 0,
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
    if (this.assetForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly'
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.assetForm.value;

    if (this.isEditMode && formValue.id) {
      // Update existing asset
      this.assetService.updateAsset(formValue.id, formValue).subscribe({
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
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update asset'
          });
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new asset
      const newAsset = { ...formValue, id: undefined };
      this.assetService.createAsset(newAsset).subscribe({
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
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create asset'
          });
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