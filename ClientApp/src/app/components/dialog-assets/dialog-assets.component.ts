import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiBreakpointService } from '@taiga-ui/core';
import { Observable, Subscription } from 'rxjs';
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
  }

  ngOnDestroy(): void {
    this.subsLanguage.unsubscribe();
  }

  public onSpeakerNameChange(name: string, data: IDialogAsset[]) {
    if (this.propagateTranslation)
      data[this.activeItemIndex].Model.$content.forEach(e => {
        if (e.SpeakerName == this.previousPropagationValue) e.SpeakerName = name;

      });
    this.previousPropagationValue = name;
  }

  public onMachineTranslate(data: IDialogAsset[]) {
    this.libreTranslate.onTranslateDialogs(data[this.activeItemIndex].Model.$content);
  }
}
