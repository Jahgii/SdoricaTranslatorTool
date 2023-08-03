import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IWizardUpload } from 'src/app/core/interfaces/i-wizard-upload';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-wizard-uploading',
  templateUrl: './load-file-wizard-uploading.component.html',
  styleUrls: ['./load-file-wizard-uploading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileWizardUploadingComponent {

  constructor(public fileReader: FileReaderService) {
  }

  async onUpload() {
    for (let key in this.fileReader.dialogAssetsUploading) {
      await this.fileReader.onUploadLanguage(key);
    }
  }

  onRetryUpload(language: KeyValue<string, IWizardUpload>) {
    language.value.UploadError = false;
    language.value.Uploaded = false;
    language.value.Uploading = true;
  }
}
