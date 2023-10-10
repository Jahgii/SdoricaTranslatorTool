import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TuiAlertService } from '@taiga-ui/core';
import { TuiFileLike } from '@taiga-ui/kit';
import { firstValueFrom, of, switchMap } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-input',
  templateUrl: './load-file-input.component.html',
  styleUrls: ['./load-file-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileInputComponent {

  readonly loadedFile$ = this.fileReader.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(
    public fileReader: FileReaderService,
    private alert: TuiAlertService,
    private translate: TranslateService
  ) {
  }

  onReadFile(file: TuiFileLike) {
    this.fileReader.onReadFile(file as File);
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    let alert = this.alert.open(this.translate.instant('error-file-obb'), { label: 'Error' });

    firstValueFrom(alert);
  }

}
