import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fadeinAnimation } from 'src/app/core/animations/fadein';
import { popinAnimation } from 'src/app/core/animations/popin';
import { ICommonWord } from 'src/app/core/interfaces/i-common-word';
import { CommonWordsService } from 'src/app/core/services/common-words.service';

@Component({
  selector: 'app-common-words',
  templateUrl: './common-words.component.html',
  styleUrls: ['./common-words.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation,
    fadeinAnimation
  ]
})
export class CommonWordsComponent {
  public menuOpen = false;

  public dialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 55,
    yBottomMargin: 10
  };

  public listDialogState = {
    isDragging: false,
    isHidden: true,
    xDiff: 0,
    yDiff: 0,
    x: 5,
    y: 5,
    yTopMargin: 50,
    yBottomMargin: 10
  };

  public commonWordForm: FormGroup = this.fB.group({
    Original: ['', [Validators.required]],
    Translation: ['', [Validators.required]],
  });

  constructor(
    public commonWords: CommonWordsService,
    private fB: FormBuilder,
    private cd: ChangeDetectorRef
  ) { }

  public onShowCreateNew() {
    this.menuOpen = false;
    this.dialogState.isHidden = !this.dialogState.isHidden;

    this.cd.detectChanges();
  }

  public onShowList() {
    this.menuOpen = false;
    this.listDialogState.isHidden = !this.listDialogState.isHidden;

    this.cd.detectChanges();
  }

  public async onCreateKey() {
    let word: ICommonWord = this.commonWordForm.getRawValue();

    await this.commonWords.create(word);
  }

  public onCreateOther() {
    this.commonWordForm.reset(undefined, { emitEvent: false });
    this.commonWords.createOther$.next(false);
  }

}
