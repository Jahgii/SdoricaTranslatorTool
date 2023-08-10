import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-export-translation',
  templateUrl: './export-translation.component.html',
  styleUrls: ['./export-translation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExportTranslationComponent {
  public activeItemIndex = 0;
  public languageSelected = false;
}
