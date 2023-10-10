import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of } from 'rxjs';
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';

@Component({
  selector: 'app-load-file-localization',
  templateUrl: './load-file-localization.component.html',
  styleUrls: ['./load-file-localization.component.scss']
})
export class LoadFileLocalizationComponent {
  @Input() mode: 'import' | 'export' = 'import';

  readonly loadedFile$ = this.fLR.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fLR: FileReaderLocalizationService) {
  }

  onReadFile(file: TuiFileLike) {
    switch (this.mode) {
      case 'import':
        this.fLR.onReadFile(file as File);
        break;
      case 'export':
        this.fLR.onExportFile(file as File);
        break;
    }
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }

  onNext() {
    this.fLR.fileProgressState$.next('finish');
  }
}