import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiFileLike, TuiInputFilesModule, TuiMarkerIconModule, TuiProgressModule } from '@taiga-ui/kit';
import { switchMap, of } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiLinkModule } from '@taiga-ui/core';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { NgIf, AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-load-obb-file-export',
    templateUrl: './load-obb-file-export.component.html',
    styleUrls: ['./load-obb-file-export.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgIf, TuiBlockStatusModule, TuiButtonModule, TuiInputFilesModule, FormsModule, ReactiveFormsModule, TuiMarkerIconModule, TuiLinkModule, TuiProgressModule, AsyncPipe, DecimalPipe, TranslateModule]
})
export class LoadObbFileExportComponent {
  @Output() next = new EventEmitter();
  readonly fileControl: FormControl<TuiFileLike | null> = new FormControl();
  readonly loadedFile$ = this.fileControl.valueChanges.pipe(
    switchMap(file => (file ? this.onReadFile(file) : of(null)))
  );

  constructor(public fileReader: FileReaderService) {
  }

  public async onReadFile(file: TuiFileLike) {
    this.fileReader.onExportFile(file as File);
    return of(file);
  }

  public onRejectFile(file: TuiFileLike | readonly TuiFileLike[]): void {
    console.log("REJECTED FILE");
  }

  public onNext() {
    this.next.emit();
  }

}
