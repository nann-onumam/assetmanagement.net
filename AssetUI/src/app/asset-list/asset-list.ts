import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetService, Asset } from '../asset.service';

@Component({
  selector: 'app-asset-list',
  imports: [CommonModule],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.scss',
})
export class AssetList implements OnInit {
  assets: Asset[] = [];

  constructor(private assetService: AssetService) {}

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (data) => this.assets = data,
      error: (err) => console.error('Error loading assets', err)
    });
  }
}
