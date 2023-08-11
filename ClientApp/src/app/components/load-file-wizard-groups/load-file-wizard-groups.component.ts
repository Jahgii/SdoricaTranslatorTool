import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IGroup } from 'src/app/core/interfaces/i-dialog-group';
import { FileReaderService } from 'src/app/core/services/file-reader.service';

@Component({
  selector: 'app-load-file-wizard-groups',
  templateUrl: './load-file-wizard-groups.component.html',
  styleUrls: ['./load-file-wizard-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadFileWizardGroupsComponent implements OnDestroy {
  @ViewChild('formMainGroup') formMainGroup!: ElementRef<HTMLFormElement>;
  @ViewChild('formGroup') formGroup!: ElementRef<HTMLFormElement>;

  public uploading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public invalidForm$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public uploadingFinish$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public groups!: IGroup[];

  constructor(public fileReader: FileReaderService) {
    document.addEventListener('invalid', this.onInvalid, true);
    let groupsTemp = [];
    let groupsService = fileReader.dialogAssetsGroups[fileReader.defaultLanguage.value];
    for (let mainGroup in groupsService) {
      for (let group in groupsService[mainGroup]) {
        groupsTemp.push(groupsService[mainGroup][group]);
      }
    }

    this.groups = groupsTemp;
  }

  ngOnDestroy(): void {
    document.removeEventListener('invalid', this.onInvalid, true);
  }

  public onInvalid(ev: Event) {
    ev.preventDefault();
  }

  public async onUpload() {
    this.uploading$.next(true);
    await this.fileReader.onUploadGroups();
    this.uploading$.next(false);
    this.uploadingFinish$.next(true);
  }

  public onNext() {
    this.fileReader.uploadingGroupsFinish$.next(true);
  }

  public onGroupChange() {
    let main = !this.formMainGroup.nativeElement.reportValidity();
    let group = !this.formGroup.nativeElement.reportValidity();
    this.invalidForm$.next(main || group);
  }

}
