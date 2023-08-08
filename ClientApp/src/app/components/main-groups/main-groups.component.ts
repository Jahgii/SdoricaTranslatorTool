import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IMainGroup, ILanguage } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-main-groups',
  templateUrl: './main-groups.component.html',
  styleUrls: ['./main-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class MainGroupsComponent {
  public showBlockStatus: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public mainGroups$!: Observable<IMainGroup[]>;
  public languages!: string[];
  public language: FormControl = new FormControl('', Validators.required);
  private subsLanguage!: Subscription;
  public order = new Map();

  constructor(private api: ApiService, private local: LocalStorageService) { }

  ngOnInit(): void {
    this.subsLanguage = this.language.valueChanges.subscribe((lang: string) => {
      this.local.setDefaultLang(lang);
      this.mainGroups$ = this.api.getWithHeaders('maingroups', { language: lang });
    });

    firstValueFrom(this.api.get<ILanguage[]>('languages'))
      .then(r => {
        if (r.length == 0) {
          this.showBlockStatus.next(true);
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
}
