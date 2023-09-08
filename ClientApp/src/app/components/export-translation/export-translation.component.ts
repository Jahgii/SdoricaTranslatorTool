import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FileReaderGamedataService } from 'src/app/core/services/file-reader-gamedata.service';
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-export-translation',
  templateUrl: './export-translation.component.html',
  styleUrls: ['./export-translation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FileReaderService, FileReaderLocalizationService, FileReaderGamedataService]
})
export class ExportTranslationComponent {
  public activeItemIndex = 2;
  public languageSelected = false;


}
