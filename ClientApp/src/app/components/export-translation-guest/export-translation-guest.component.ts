import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExportTranslationService } from 'src/app/core/services/export-translation.service';

@Component({
  selector: 'app-export-translation-guest',
  templateUrl: './export-translation-guest.component.html',
  styleUrls: ['./export-translation-guest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportTranslationGuestComponent {

  constructor(
    public eTS: ExportTranslationService
  ) { }

}
