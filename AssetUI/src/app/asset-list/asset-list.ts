import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AssetService } from '../asset.service';
import { Asset } from '../models/asset';
import { AssetFormComponent } from '../asset-form/asset-form';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { SliderModule } from 'primeng/slider';

@Component({
  selector: 'app-asset-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ConfirmDialogModule, AssetFormComponent, ToastModule, PaginatorModule, SliderModule, FormsModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.scss',
})
export class AssetList implements OnInit {
  assets: Asset[] = [];
  showForm = false;
  editingAsset: Asset | null = null;
  
  // Pagination properties
  first: number = 0;
  rows: number = 10;
  totalRecords: number = 0;

  private assetService = inject(AssetService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data;
        this.totalRecords = data.length;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading assets', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load assets'
        });
        this.cdr.markForCheck();
      }
    });
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.cdr.markForCheck();
  }

  get paginatedAssets(): Asset[] {
    if (!this.assets) return [];
    return this.assets.slice(this.first, this.first + this.rows);
  }

  openAddModal(): void {
    this.editingAsset = null;
    this.showForm = true;
  }

  viewAsset(asset: Asset): void {
    if (asset.id) {
      this.router.navigate(['/assets/profile', asset.id]);
    }
  }

  editAsset(asset: Asset): void {
    this.editingAsset = asset;
    this.showForm = true;
  }

  onFormClose(): void {
    this.showForm = false;
    this.editingAsset = null;
    this.cdr.markForCheck();
  }

  onAssetSaved(asset: Asset): void {
    const isUpdate = this.editingAsset !== null;
    this.showForm = false;
    this.editingAsset = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: isUpdate ? 'Asset updated successfully' : 'Asset created successfully'
    });
    this.loadAssets();
    this.cdr.markForCheck();
  }

  deleteAsset(asset: Asset): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete asset "${asset.name}"? This action cannot be undone.`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (asset.id) {
          this.assetService.deleteAsset(asset.id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Asset deleted successfully'
              });
              this.loadAssets();
            },
            error: (err) => {
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

  getStatusClass(status: string | null | undefined): string {
    if (!status) return 'status-available';
    return status.toLowerCase() === 'borrowed' ? 'status-borrowed' : 'status-available';
  }
}
