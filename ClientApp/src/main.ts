import { enableProdMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { JwtModule } from '@auth0/angular-jwt';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { withInterceptorsFromDi, provideHttpClient, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { TuiLanguageName } from '@taiga-ui/i18n/interfaces';
import { tuiLanguageSwitcher } from '@taiga-ui/i18n/switch';
import { of } from 'rxjs';
import { TUI_LANGUAGE, TUI_ENGLISH_LANGUAGE } from '@taiga-ui/i18n';
import { NgDompurifySanitizer } from '@tinkoff/ng-dompurify';
import { TUI_SANITIZER, TuiAlertModule, TuiRootModule, TuiThemeNightModule } from '@taiga-ui/core';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
            BrowserModule,
            AppRoutingModule,
            FormsModule,
            ReactiveFormsModule,

            //Login
            SocialLoginModule,
            GoogleSigninButtonModule,

            //Taiga
            TuiRootModule,
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
                    allowedDomains: [environment.allowedDomains]
                },
            })),
        {
            provide: 'BASE_URL', useFactory: getBaseUrl, deps: []
        },
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(environment.googleClientId)
                    }
                ],
                onError: (err) => {
                    console.error(err);
                }
            } as SocialAuthServiceConfig,
        },
        {
            provide: TUI_SANITIZER,
            useClass: NgDompurifySanitizer
        },
        {
            provide: TUI_LANGUAGE,
            useValue: of(TUI_ENGLISH_LANGUAGE)
        },
        tuiLanguageSwitcher(async (language: TuiLanguageName): Promise<unknown> => {
            switch (language) {
                case `es`:
                    return import(`@taiga-ui/i18n/languages/spanish`);
                default:
                    return import(`@taiga-ui/i18n/languages/english`);
            }
        }),
        provideAnimations(),
        provideHttpClient(withInterceptorsFromDi())
    ]
})
    .catch(err => console.log(err));
