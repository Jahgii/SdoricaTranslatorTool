import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { of, switchMap } from 'rxjs';
import { FileReaderGamedataService } from 'src/app/core/services/file-reader-gamedata.service';

@Component({
  selector: 'app-load-file-gamedata',
  templateUrl: './load-file-gamedata.component.html',
  styleUrls: ['./load-file-gamedata.component.scss']
})
export class LoadFileGamedataComponent {
  @Input() mode: 'import' | 'export' = 'import';

  readonly fileControl: FormControl<TuiFileLike | null> = new FormControl();
  readonly loadedFile$ = this.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fileGameReader: FileReaderGamedataService) {
  }

  onReadFile(file: TuiFileLike) {
    switch (this.mode) {
      case 'import':
        this.fileGameReader.onReadFile(file as File);
        break;
      case 'export':
        this.fileGameReader.onExportFile(file as File);
        break;
    }
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }

}
