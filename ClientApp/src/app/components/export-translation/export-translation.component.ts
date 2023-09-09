import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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
export class ExportTranslationComponent implements OnInit, OnDestroy {
  public activeItemIndex = 1;
  public languageSelected = false;

  private subsSteppertwo!: Subscription;

  constructor(private fileLocalizationReader: FileReaderLocalizationService) { }

  ngOnInit(): void {
    this.subsSteppertwo = this.fileLocalizationReader.fileProgressState$.subscribe(state => {
      if (state == 'finish') {
        this.activeItemIndex = 2;
      }
    });
  }

  ngOnDestroy(): void {
    this.subsSteppertwo.unsubscribe();
  }

}
