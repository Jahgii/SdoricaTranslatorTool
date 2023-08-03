import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IWizardUpload } from 'src/app/core/interfaces/i-wizard-upload';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-wizard-uploading',
  templateUrl: './load-file-wizard-uploading.component.html',
  styleUrls: ['./load-file-wizard-uploading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileWizardUploadingComponent {
  public uploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(public fileReader: FileReaderService) {
  }

  async onUpload() {
    this.uploading$.next(true);
    for (let key in this.fileReader.dialogAssetsUploading) {
      await this.fileReader.onUploadLanguage(key);
    }
    this.uploading$.next(false);
  }

  onRetryUpload(language: KeyValue<string, IWizardUpload>) {
    language.value.UploadError.next(false);
    language.value.Uploaded.next(false);
    language.value.Uploading.next(true);
  }
}
