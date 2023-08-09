import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiBreakpointService } from '@taiga-ui/core';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { IGroup, ILanguage } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-dialog-assets',
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class DialogAssetsComponent {
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
  public languages!: string[];
  public language: FormControl = new FormControl('', Validators.required);
  private subsLanguage!: Subscription;

  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    private route: ActivatedRoute,
    @Inject(TuiBreakpointService) readonly breakpointService$: TuiBreakpointService
  ) { }

  ngOnInit(): void {
    let mainGroup = this.route.snapshot.params['mid'];
    let group = this.route.snapshot.params['gid'];

    this.subsLanguage = this.language.valueChanges.subscribe((lang: string) => {
      this.local.setDefaultLang(lang);
      this.dialogAssets$ = this.api.getWithHeaders('dialogassets', { language: lang, mainGroup: mainGroup, group: group });
    });

    firstValueFrom(this.api.get<ILanguage[]>('languages'))
      .then(r => {
        if (r.length == 0) {
          return;
        }

        this.languages = r.map(e => e.Name);

        let defaultLang = this.local.getDefaultLang();
        let lang = r.find(e => e.Name == defaultLang);

        if (!lang) {
          lang = r[0];
          this.local.setDefaultLang(lang.Name);
        }
        this.language.patchValue(lang.Name);
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
}
