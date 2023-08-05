import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { IMainGroup } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  public mainGroups$: Observable<IMainGroup[]> = this.api.get('maingroups');
  public order = new Map();

  constructor(private api: ApiService) { }



}
