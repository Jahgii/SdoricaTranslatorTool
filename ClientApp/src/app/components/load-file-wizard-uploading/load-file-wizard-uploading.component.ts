import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-wizard-uploading',
  templateUrl: './load-file-wizard-uploading.component.html',
  styleUrls: ['./load-file-wizard-uploading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
