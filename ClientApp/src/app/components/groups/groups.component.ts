import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { popinAnimation } from 'src/app/core/animations/popin';
import { IGroup, ILanguage } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    popinAnimation
  ],
})
export class GroupsComponent {
  public groups$!: Observable<IGroup[]>;
  public languages!: string[];
  public language: FormControl = new FormControl('', Validators.required);
  private subsLanguage!: Subscription;
  public order = new Map();

  constructor(
    private api: ApiService,
    private local: LocalStorageService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let mainGroup = this.route.snapshot.params['id'];

    this.subsLanguage = this.language.valueChanges.subscribe((lang: string) => {
      this.local.setDefaultLang(lang);
      this.groups$ = this.api.getWithHeaders('groups', { language: lang, mainGroup: mainGroup });
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
}
