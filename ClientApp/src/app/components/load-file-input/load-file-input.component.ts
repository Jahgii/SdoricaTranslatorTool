import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { of, switchMap } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-input',
  templateUrl: './load-file-input.component.html',
  styleUrls: ['./load-file-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileInputComponent {
  readonly fileControl: FormControl<TuiFileLike | null> = new FormControl();
  readonly loadedFile$ = this.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fileReader: FileReaderService) {
  }

  onReadFile(file: TuiFileLike) {
    this.fileReader.onReadFile(file as File);
    console.log("Trigger");
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }

}
