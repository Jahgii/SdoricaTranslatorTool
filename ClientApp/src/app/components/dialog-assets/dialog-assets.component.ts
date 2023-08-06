import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { IDialogAsset } from 'src/app/core/interfaces/i-dialog-asset';
import { IGroup, ILanguage } from 'src/app/core/interfaces/i-dialog-group';
import { ApiService } from 'src/app/core/services/api.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
  selector: 'app-dialog-assets',
  templateUrl: './dialog-assets.component.html',
  styleUrls: ['./dialog-assets.component.scss']
})
export class DialogAssetsComponent {
  public dialogAssets$!: Observable<IDialogAsset[]>;
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
}
