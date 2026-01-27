import { Routes } from '@angular/router';
import { AssetList } from './asset-list/asset-list';

export const routes: Routes = [
  { path: '', component: AssetList },
  { path: '**', redirectTo: '' }
];
