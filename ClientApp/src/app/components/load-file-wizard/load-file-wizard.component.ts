import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { TuiStepperComponent } from '@taiga-ui/kit';
import { BehaviorSubject } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-wizard',
  templateUrl: './load-file-wizard.component.html',
  styleUrls: ['./load-file-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileWizardComponent {
  @ViewChild(TuiStepperComponent) stepper!: TuiStepperComponent;

  public activeItemIndex = 0;
  public languageSelected = false;

  constructor(public fileReader: FileReaderService) {
    this.onFileReader();
  }

  private onFileReader() {
    this.fileReader.fileProgressState$.subscribe(state => {
      if (state == 'finish') {
        this.activeItemIndex = 1;
        this.stepper.activate(1);
      }
    });

    this.fileReader.uploadingFinish$.subscribe(next => {
      if (next === false) return;
      this.activeItemIndex = 3;
      this.stepper.activate(3);
    })
  }

  public onSelectLanguage(language: string, $event: boolean) {
    if ($event) this.fileReader.dialogAssetsUploading[language] = {
      Uploading: new BehaviorSubject(false),
      Uploaded: new BehaviorSubject(false),
      UploadError: new BehaviorSubject(false),
      FileSkip: new BehaviorSubject(0),
      Language: language
    };
    else delete (this.fileReader.dialogAssetsUploading[language]);

    for (let key in this.fileReader.dialogAssetsInclude) {
      if (this.fileReader.dialogAssetsInclude[key] == true) {
        this.languageSelected = true;
        return;
      }
    }

    this.languageSelected = false;
  }

}
