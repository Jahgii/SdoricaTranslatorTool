import { Component, inject } from '@angular/core';
import { UserLanguageService } from './user-language.service';
import { TuiButton } from '@taiga-ui/core';

@Component({
  selector: 'app-user-language',
  imports: [
    TuiButton,
  ],
  templateUrl: './user-language.component.html',
  styleUrl: './user-language.component.scss'
})
export class UserLanguageComponent {
  protected readonly uLS = inject(UserLanguageService);
}
