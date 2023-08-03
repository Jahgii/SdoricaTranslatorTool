import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent {
  public nightMode$ = new BehaviorSubject<boolean>(false);

  public switchTheme(): void {
    this.nightMode$.next(!this.nightMode$.value);
  }
}
