import { Component, signal } from '@angular/core';
import { AssetList } from './asset-list/asset-list';

@Component({
  selector: 'app-root',
  imports: [AssetList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('AssetUI');
}
