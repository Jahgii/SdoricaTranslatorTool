import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';
import { TranslateModule } from '@ngx-translate/core';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiScrollbarModule } from '@taiga-ui/core';
import { TuiSvgModule } from '@taiga-ui/core/components/svg';
import { TuiLoaderModule } from '@taiga-ui/core/components/loader';
import { NgFor, NgStyle, NgIf, AsyncPipe, KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-load-file-wizard-uploading',
    templateUrl: './load-file-wizard-uploading.component.html',
    styleUrls: ['./load-file-wizard-uploading.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [NgFor, TuiLoaderModule, TuiSvgModule, NgStyle, NgIf, TuiScrollbarModule, TuiButtonModule, AsyncPipe, KeyValuePipe, TranslateModule]
})
export class LoadFileWizardUploadingComponent {
  public uploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public uploadingFinish$!: Observable<boolean>;

  constructor(public fileReader: FileReaderService) {
  }

  async onUpload() {
    this.uploading$.next(true);
    let uploadingStatus: Observable<boolean>[] = [];
    for (let key in this.fileReader.dialogAssetsUploading) {
      await this.fileReader.onUploadLanguage(key);
      uploadingStatus.push(this.fileReader.dialogAssetsUploading[key].Uploaded);
    }
    this.uploadingFinish$ = combineLatest(uploadingStatus)
      .pipe(
        map((results) => results.every(e => e === true))
      );

    this.uploading$.next(false);
  }

  onNext() {
    this.fileReader.uploadingFinish$.next(true);
  }
}
