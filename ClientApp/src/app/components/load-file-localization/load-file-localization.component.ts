import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of } from 'rxjs';
import { encode, decode } from "@msgpack/msgpack";
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';

@Component({
  selector: 'app-load-file-localization',
  templateUrl: './load-file-localization.component.html',
  styleUrls: ['./load-file-localization.component.scss']
})
export class LoadFileLocalizationComponent {
  readonly fileControl: FormControl<TuiFileLike | null> = new FormControl();
  readonly loadedFile$ = this.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fileLocalizationReader: FileReaderLocalizationService) {
  }

  onReadFile(file: TuiFileLike) {
    this.fileLocalizationReader.onReadFile(file as File);
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }
}