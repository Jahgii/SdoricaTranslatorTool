import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { TuiBreakpointService } from '@taiga-ui/core';
import { Subscription } from 'rxjs';
import { FileReaderGamedataService } from 'src/app/core/services/file-reader-gamedata.service';
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';
import { FileReaderService } from 'src/app/core/services/file-reader.service';
import { LoadFileGamedataComponent } from '../load-file-gamedata/load-file-gamedata.component';
import { LoadFileLocalizationComponent } from '../load-file-localization/load-file-localization.component';
import { LoadObbFileExportComponent } from '../load-obb-file-export/load-obb-file-export.component';
import { TuiStepperModule } from '@taiga-ui/kit';
import { NgIf, NgTemplateOutlet, AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-export-translation',
    templateUrl: './export-translation.component.html',
    styleUrls: ['./export-translation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [FileReaderService, FileReaderLocalizationService, FileReaderGamedataService],
    standalone: true,
    imports: [NgIf, TuiStepperModule, NgTemplateOutlet, LoadObbFileExportComponent, LoadFileLocalizationComponent, LoadFileGamedataComponent, AsyncPipe]
})
export class ExportTranslationComponent implements OnInit, OnDestroy {
  public activeItemIndex = 1;
  public languageSelected = false;

  private subsSteppertwo!: Subscription;

  constructor(
    private fileLocalizationReader: FileReaderLocalizationService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) { }

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
