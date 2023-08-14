import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TuiFileLike } from '@taiga-ui/kit';
import { switchMap, of, Observable, Subscription } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-obb-file-export',
  templateUrl: './load-obb-file-export.component.html',
  styleUrls: ['./load-obb-file-export.component.scss']
})
export class LoadObbFileExportComponent {
  public exportSubs!: Subscription;
  readonly fileControl: FormControl<TuiFileLike | null> = new FormControl();
  readonly loadedFile$ = this.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fileReader: FileReaderService) {
    this.exportSubs = this.fileReader.fileProgressState$.subscribe(e => {
      if (e === 'finish') {
        this.fileReader.onExport();
      }
    });
  }

  async onReadFile(file: TuiFileLike) {
    this.fileReader.onReadFile(file as File);
    return of(file);
  }

  onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }

}
