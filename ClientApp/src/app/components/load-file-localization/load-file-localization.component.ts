import { Component, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiFileLike, TuiInputFilesModule, TuiMarkerIconModule, TuiProgressModule } from '@taiga-ui/kit';
import { switchMap, of } from 'rxjs';
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiLinkModule } from '@taiga-ui/core';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { NgTemplateOutlet, NgIf, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-load-file-localization',
    templateUrl: './load-file-localization.component.html',
    styleUrls: ['./load-file-localization.component.scss'],
    standalone: true,
    imports: [NgTemplateOutlet, NgIf, TuiBlockStatusModule, TuiButtonModule, TuiInputFilesModule, FormsModule, ReactiveFormsModule, TuiMarkerIconModule, TuiLinkModule, TuiProgressModule, AsyncPipe, DecimalPipe, TranslateModule]
})
export class LoadFileLocalizationComponent {
  @Input() mode: 'import' | 'export' = 'import';

  readonly fileControl: FormControl<TuiFileLike | null> = new FormControl();
  readonly loadedFile$ = this.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fileLocalizationReader: FileReaderLocalizationService) {
  }

  onReadFile(file: TuiFileLike) {
    switch (this.mode) {
      case 'import':
        this.fileLocalizationReader.onReadFile(file as File);
        break;
      case 'export':
        this.fileLocalizationReader.onExportFile(file as File);
        break;
    }
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }

  onNext() {
    this.fileLocalizationReader.fileProgressState$.next('finish');
  }
}