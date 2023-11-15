import { enableProdMode, importProvidersFrom } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { HttpLoaderFactory } from './app/app.module';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { JwtModule } from '@auth0/angular-jwt';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TuiSidebarModule, TuiAppBarModule } from '@taiga-ui/addon-mobile';
import { TuiAutoFocusModule, TuiActiveZoneModule, TuiLetModule } from '@taiga-ui/cdk';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TuiTableModule, TuiTableFiltersModule } from '@taiga-ui/addon-table';
import { TuiBlockStatusModule } from '@taiga-ui/layout';
import { TuiInputFilesModule, TuiStepperModule, TuiIslandModule, TuiMarkerIconModule, TuiProgressModule, TuiCheckboxBlockModule, TuiCheckboxModule, TuiInputModule, TuiFilterModule, TuiTilesModule, TuiSelectModule, TuiDataListWrapperModule, TuiTabsModule, TuiTextareaModule, TuiToggleModule, TuiInputInlineModule, TuiBadgeModule, TuiInputNumberModule, TuiComboBoxModule, TuiFilterByInputPipeModule, TuiRadioBlockModule, TuiAvatarModule } from '@taiga-ui/kit';
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
import { TUI_SANITIZER, TuiRootModule, TuiDialogModule, TuiAlertModule, TuiThemeNightModule, TuiModeModule, TuiButtonModule, TuiSvgModule, TuiLoaderModule, TuiScrollbarModule, TuiTextfieldControllerModule, TuiDataListModule, TuiTooltipModule, TuiHintModule, TuiGroupModule, TuiDropdownModule, TuiHostedDropdownModule, TuiExpandModule, TuiLinkModule } from '@taiga-ui/core';
import { environment as environment_1 } from 'src/environments/environment';
import { GoogleLoginProvider, SocialAuthServiceConfig, SocialLoginModule, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';

export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
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
