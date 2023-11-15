import { ChangeDetectionStrategy, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { TuiBreakpointService, TuiTextfieldControllerModule, TuiPrimitiveTextfieldModule, TuiDataListModule } from '@taiga-ui/core';
import { TuiStepperComponent, TuiStepperModule, TuiSelectModule, TuiCheckboxBlockModule } from '@taiga-ui/kit';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FileReaderGamedataService } from 'src/app/core/services/file-reader-gamedata.service';
import { FileReaderLocalizationService } from 'src/app/core/services/file-reader-localization.service';
import { FileReaderService } from 'src/app/core/services/file-reader.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { LoadFileGamedataComponent } from '../load-file-gamedata/load-file-gamedata.component';
import { LoadFileLocalizationComponent } from '../load-file-localization/load-file-localization.component';
import { LoadFileWizardGroupsComponent } from '../load-file-wizard-groups/load-file-wizard-groups.component';
import { LoadFileWizardUploadingComponent } from '../load-file-wizard-uploading/load-file-wizard-uploading.component';
import { TuiButtonModule } from '@taiga-ui/core/components/button';
import { TuiDataListWrapperModule } from '@taiga-ui/kit/components/data-list-wrapper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadFileInputComponent } from '../load-file-input/load-file-input.component';
import { NgIf, NgTemplateOutlet, NgFor, AsyncPipe, KeyValuePipe } from '@angular/common';

@Component({
    selector: 'app-load-file-wizard',
    templateUrl: './load-file-wizard.component.html',
    styleUrls: ['./load-file-wizard.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        FileReaderService,
        FileReaderLocalizationService,
        FileReaderGamedataService
    ],
    standalone: true,
    imports: [NgIf, TuiStepperModule, NgTemplateOutlet, LoadFileInputComponent, TuiSelectModule, TuiTextfieldControllerModule, FormsModule, ReactiveFormsModule, TuiPrimitiveTextfieldModule, TuiDataListModule, TuiDataListWrapperModule, NgFor, TuiCheckboxBlockModule, TuiButtonModule, LoadFileWizardUploadingComponent, LoadFileWizardGroupsComponent, LoadFileLocalizationComponent, LoadFileGamedataComponent, TuiBlockStatusModule, RouterLink, AsyncPipe, KeyValuePipe, TranslateModule]
})
export class LoadFileWizardComponent implements OnDestroy {
  @ViewChild(TuiStepperComponent) stepper!: TuiStepperComponent;

  private subsStepperOne!: Subscription;
  private subsStepperthree!: Subscription;
  private subsStepperfour!: Subscription;
  private subsStepperfive!: Subscription;
  private subsSteppersix!: Subscription;

  public activeItemIndex = 0;
  public languageSelected = false;

  public languagesSelected!: string[];
  public multiLanguage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    public fileReader: FileReaderService,
    public fileLocalizationReader: FileReaderLocalizationService,
    public fileGamedataReader: FileReaderGamedataService,
    public languageOrigin: LanguageOriginService,
    private storage: LocalStorageService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) {
    this.onFileReader();
  }

  ngOnDestroy(): void {
    this.subsStepperOne.unsubscribe();
    this.subsStepperthree.unsubscribe();
    this.subsStepperfour.unsubscribe();
    this.subsStepperfive.unsubscribe();
    this.subsSteppersix.unsubscribe();
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

    this.subsStepperfive = this.fileLocalizationReader.fileProgressState$.subscribe(state => {
      if (state == 'finish') {
        this.activeItemIndex = 5;
        this.languageOrigin.onRetriveLanguages();
        this.stepper.activate(5);
      }
    });

    this.subsSteppersix = this.fileGamedataReader.fileProgressState$.subscribe(state => {
      if (state == 'finish') {
        this.activeItemIndex = 6;
        this.languageOrigin.onRetriveLanguages();
        this.stepper.activate(6);
      }
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

  public onSelectLanguageEnd() {
    this.storage.setDefaultLang(this.fileReader.defaultLanguage.value);
    this.activeItemIndex = 2
  }

}
