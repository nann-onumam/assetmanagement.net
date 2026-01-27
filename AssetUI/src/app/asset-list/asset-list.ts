import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AssetService } from '../asset.service';
import { Asset } from '../models/asset';
import { AssetFormComponent } from '../asset-form/asset-form';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';

@Component({
  selector: 'app-asset-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule,
    ProgressSpinnerModule,
    PaginatorModule,
    SelectModule,
    SplitButtonModule,
    AssetFormComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.scss',
})
export class AssetList implements OnInit {
  @ViewChild(AssetFormComponent) assetForm!: AssetFormComponent;

  private assetService = inject(AssetService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  assets: Asset[] = [];
  loading: boolean = false;
  formVisible: boolean = false;
  editingAsset: Asset | null = null;

  // Custom pagination properties
  first2: number = 0;
  rows2: number = 10;
  options = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '25', value: 25 },
    { label: '50', value: 50 },
    { label: '100', value: 100 }
  ];

  // Action menu items for split button
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

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.loading = true;
    this.assetService.getAssets().subscribe({
      next: (data) => {
        this.assets = data.map(asset => ({
          ...asset,
          status: this.getRandomStatus() // Demo status
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

  viewAsset(asset: Asset): void {
    // For now, just show a toast message. You can expand this to show a view dialog
    this.messageService.add({
      severity: 'info',
      summary: 'View Asset',
      detail: `Viewing details for: ${asset.name}`
    });
  }

  openNewAssetForm(): void {
    this.editingAsset = null;
    this.formVisible = true;
  }

  editAsset(asset: Asset): void {
    this.editingAsset = asset;
    this.formVisible = true;
  }

  onAssetSaved(asset: Asset): void {
    if (this.editingAsset && this.editingAsset.id === asset.id) {
      // Update existing asset in list
      const index = this.assets.findIndex(a => a.id === asset.id);
      if (index !== -1) {
        this.assets[index] = { ...this.assets[index], ...asset };
      }
    } else {
      // Add new asset to list
      this.assets = [asset, ...this.assets];
    }
    this.formVisible = false;
    this.editingAsset = null;
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

  getRandomStatus(): 'Available' | 'Borrowed' | 'Maintenance' | 'Retired' {
    const statuses: ('Available' | 'Borrowed' | 'Maintenance' | 'Retired')[] = [
      'Available',
      'Borrowed',
      'Maintenance',
      'Retired'
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  deleteAsset(asset: Asset): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${asset.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (asset.id) {
          this.assetService.deleteAsset(asset.id).subscribe({
            next: () => {
              this.assets = this.assets.filter(a => a.id !== asset.id);
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Asset deleted successfully'
              });
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

  onPageChange2(event: any): void {
    this.first2 = event.first;
    this.rows2 = event.rows;
  }
}
