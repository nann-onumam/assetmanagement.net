import { Routes } from '@angular/router';
import { AssetList } from './asset-list/asset-list';
import { AssetFormComponent } from './asset-form/asset-form';

export const routes: Routes = [
  { path: '', component: AssetList },
  { path: 'add-asset', component: AssetFormComponent },
  { path: '**', redirectTo: '' }
];
