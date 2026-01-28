import { Component, OnInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AssetService } from '../asset.service';
import { Asset } from '../models/asset';
import { AssetFormComponent } from '../asset-form/asset-form';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-asset-profile',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ToastModule, AssetFormComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './asset-profile.html',
  styleUrl: './asset-profile.scss'
})
export class AssetProfileComponent implements OnInit, OnDestroy {
  asset: Asset | null = null;
  loading = true;
  showForm = false;
  editingAsset: Asset | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private assetService = inject(AssetService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadAsset();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAsset(): void {
    this.loading = true;
    this.cdr.markForCheck();
    
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.loading = false;
      this.cdr.markForCheck();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Asset ID not found'
      });
      return;
    }

    const assetId = Number(id);
    console.log('Loading asset with ID:', assetId);
    
    this.assetService.getAsset(assetId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Asset) => {
          console.log('Asset loaded successfully:', data);
          this.asset = data;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error loading asset:', err);
          this.loading = false;
          this.cdr.markForCheck();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load asset details'
          });
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/assets']);
  }

  editAsset(): void {
    if (this.asset) {
      console.log('Opening edit form for asset:', this.asset);
      this.editingAsset = this.asset;
      // Small delay to ensure Angular detects the change
      setTimeout(() => {
        this.showForm = true;
        console.log('Form visibility set to:', this.showForm);
        this.cdr.markForCheck();
      }, 50);
    }
  }

  onFormClose(): void {
    this.showForm = false;
    this.editingAsset = null;
    this.cdr.markForCheck();
  }

  onAssetSaved(updatedAsset: Asset): void {
    this.showForm = false;
    this.editingAsset = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Asset updated successfully'
    });
    // Reload the asset to show updated data
    this.loadAsset();
    this.cdr.markForCheck();
  }

  deleteAsset(): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete asset "${this.asset?.name}"? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.asset?.id) {
          this.assetService.deleteAsset(this.asset.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Asset deleted successfully'
              });
              setTimeout(() => this.goBack(), 1000);
            },
            error: (err: any) => {
              console.error('Error deleting asset', err);
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

  getStatusSeverity(status?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Borrowed':
        return 'warn';
      case 'Maintenance':
        return 'info';
      case 'Retired':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
