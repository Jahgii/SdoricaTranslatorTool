import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { withInterceptorsFromDi, provideHttpClient, HttpClient, withInterceptors } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { TuiLanguageName } from '@taiga-ui/i18n/interfaces';
import { tuiLanguageSwitcher } from '@taiga-ui/i18n/switch';
import { TUI_LANGUAGE, TUI_SPANISH_LANGUAGE } from '@taiga-ui/i18n';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { TUI_SANITIZER, TuiAlertModule, TuiDialogModule, TuiRootModule, TuiThemeNightModule } from '@taiga-ui/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiKeyInterceptor } from './app/core/interceptors/api-key-interceptor';
import { of } from 'rxjs';
import { JwtModule } from '@auth0/angular-jwt';

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

if (environment.production) {
    enableProdMode();
}

const appConfigTaigaUI = [
    {
        provide: TUI_SANITIZER,
        useClass: NgDompurifySanitizer
    },
    {
        provide: TUI_LANGUAGE,
        useValue: of(TUI_SPANISH_LANGUAGE)
    },
    tuiLanguageSwitcher(async (language: TuiLanguageName): Promise<unknown> => {
        switch (language) {
            case `es`:
                return import(`@taiga-ui/i18n/languages/english`);
            default:
                return import(`@taiga-ui/i18n/languages/spanish`);
        }
    }),
];

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            BrowserModule,
            AppRoutingModule,
            FormsModule,
            ReactiveFormsModule,

            //Taiga
            TuiRootModule,
            TuiDialogModule,
            TuiAlertModule,
            TuiThemeNightModule,

            TranslateModule.forRoot({
                defaultLanguage: 'es',
                loader: {
                    provide: TranslateLoader,
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                }
            }),
            JwtModule.forRoot({
                config: {
                    tokenGetter: () => localStorage.getItem("token"),
                    allowedDomains: [environment.allowedDomains],
                }
            })
        ),
        ...appConfigTaigaUI,
        provideAnimations(),
        provideHttpClient(
            withInterceptorsFromDi(),
            withInterceptors([ApiKeyInterceptor]),
        ),
    ]
}).catch(err => console.log(err));
