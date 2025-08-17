import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-app-loading',
  standalone: true,
  imports: [
    TranslateModule
  ],
  templateUrl: './app-loading.component.html',
  styleUrl: './app-loading.component.scss'
})
export class AppLoadingComponent {

}
