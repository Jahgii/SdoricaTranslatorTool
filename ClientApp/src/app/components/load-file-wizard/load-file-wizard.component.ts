import { ChangeDetectionStrategy, Component, OnDestroy, ViewChild } from '@angular/core';
import { TuiStepperComponent } from '@taiga-ui/kit';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-wizard',
  templateUrl: './load-file-wizard.component.html',
  styleUrls: ['./load-file-wizard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileWizardComponent implements OnDestroy {
  @ViewChild(TuiStepperComponent) stepper!: TuiStepperComponent;

  private subsStepperOne!: Subscription;
  private subsStepperthree!: Subscription;
  private subsStepperfour!: Subscription;

  public activeItemIndex = 0;
  public languageSelected = false;

  public languagesSelected!: string[];
  public multiLanguage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);


  constructor(public fileReader: FileReaderService) {
    this.onFileReader();
  }

  ngOnDestroy(): void {
    this.subsStepperOne.unsubscribe();
    this.subsStepperthree.unsubscribe();
    this.subsStepperfour.unsubscribe();
  }

  private onFileReader() {
    this.subsStepperOne = this.fileReader.fileProgressState$.subscribe(state => {
      if (state == 'finish') {
        this.activeItemIndex = 1;
        this.stepper.activate(1);
      }
    });

    this.subsStepperthree = this.fileReader.uploadingFinish$.subscribe(next => {
      if (next === false) return;
      this.activeItemIndex = 3;
      this.stepper.activate(3);
    });

    this.subsStepperfour = this.fileReader.uploadingGroupsFinish$.subscribe(next => {
      if (next === false) return;
      this.activeItemIndex = 4;
      this.stepper.activate(4);
    });
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

    let index = 0;
    this.languagesSelected = [];
    this.multiLanguage$.next(false);
    for (let key in this.fileReader.dialogAssetsInclude) {
      if (this.fileReader.dialogAssetsInclude[key] == true) {
        this.languageSelected = true;
        this.languagesSelected.push(key);
        index += 1;
        console.log(index, key);
        if (index == 1) {
          this.fileReader.defaultLanguage.patchValue(key);
        }
        else if (index == 2) {
          this.fileReader.defaultLanguage.patchValue(undefined);
          this.fileReader.defaultLanguage.updateValueAndValidity();
          this.multiLanguage$.next(true);
        }
      }
    }

    if (index >= 1) return;

    this.fileReader.defaultLanguage.patchValue(undefined);
    this.languageSelected = false;
  }

}
