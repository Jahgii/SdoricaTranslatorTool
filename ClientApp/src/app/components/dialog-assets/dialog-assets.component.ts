import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiBreakpointService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription, debounceTime, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { ApiService } from 'src/app/core/services/api.service';
import { LanguageOriginService } from 'src/app/core/services/language-origin.service';
import { LibreTranslateService } from 'src/app/core/services/libre-translate.service';

@Component({
  selector: 'app-dialog-assets',
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class DialogAssetsComponent implements OnInit, OnDestroy {
  readonly filterForm = new FormGroup({
    originalText: new FormControl(undefined),
  });

  readonly filterOriginalColumn = (text: string, value: string): boolean => {
    if (!value) value = "";
    return text.toLowerCase().includes(value.toLowerCase());
  };

  public pendingChanges$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public changes$: BehaviorSubject<IDialogAsset | undefined> = new BehaviorSubject<IDialogAsset | undefined>(undefined);
  private subsChanges!: Subscription;
  public openOption: boolean = false;
  public propagateTranslation: boolean = true;
  public previousPropagationValue: string = "";
  public activeItemIndex: number = 0;
  public dialogAssets$!: Observable<IDialogAsset[]>;
  private subsLanguage!: Subscription;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    public libreTranslate: LibreTranslateService,
    readonly languageOrigin: LanguageOriginService,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) { }

  ngOnInit(): void {
    let mainGroup = this.route.snapshot.params['mid'];
    let group = this.route.snapshot.params['gid'];
    this.subsLanguage = this.languageOrigin.language$.subscribe((lang: string) => {
      this.dialogAssets$ = this.api.getWithHeaders('dialogassets', { language: lang, mainGroup: mainGroup, group: group });
    });
    this.subsChanges = this.changes$.pipe(
      debounceTime(1000)
    ).subscribe(async dialogAsset => {
      if (!dialogAsset) return;
      await firstValueFrom(this.api.put('dialogassets', dialogAsset))
        .then(
          r => {

          },
          error => { console.log("CANT SAVE DATA"); }
        );
      this.pendingChanges$.next(false);
    });
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
    this.subsChanges.unsubscribe();
  }

  public onTranslatedChange(data: IDialogAsset[]) {
    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    if (this.propagateTranslation)
      data[this.activeItemIndex].Model.$content.forEach(e => {
        if (e.SpeakerName == this.previousPropagationValue) e.SpeakerName = name;

      });
    this.previousPropagationValue = name;
    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }

  public onTextChange(dialogAsset: IDialogAsset) {
    this.pendingChanges$.next(true);
    this.changes$.next(dialogAsset);
  }

  public async onMachineTranslate(data: IDialogAsset[]) {
    await this.libreTranslate.onTranslateDialogs(data[this.activeItemIndex].Model.$content);
    this.pendingChanges$.next(true);
    this.changes$.next(data[this.activeItemIndex]);
  }
}
