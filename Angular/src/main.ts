import { provideEventPlugins } from "@taiga-ui/event-plugins";
import { enableProdMode, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { withInterceptorsFromDi, provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app/app-routing.module';
import { bootstrapApplication } from '@angular/platform-browser';
import { TUI_LANGUAGE, TUI_ENGLISH_LANGUAGE, TUI_SPANISH_LANGUAGE, TuiLanguageName, tuiLanguageSwitcher } from '@taiga-ui/i18n';
import { ApiKeyInterceptor } from './app/core/interceptors/api-key-interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { of } from 'rxjs';
import { IndexDBi18nLoader } from "./app/core/index-db-i18-loader";
import { IndexDBService } from "./app/core/services/index-db.service";

if (environment.production) {
    enableProdMode();
}

const appConfigTaigaUI = [
    {
        provide: TUI_LANGUAGE,
        useValue: of(TUI_ENGLISH_LANGUAGE, TUI_SPANISH_LANGUAGE)
    },
    tuiLanguageSwitcher(async (language: TuiLanguageName): Promise<unknown> => {
        switch (language) {
            case 'spanish':
                return import('@taiga-ui/i18n/languages/spanish');
            default:
                return import('@taiga-ui/i18n/languages/english');
        }
    }),
];

bootstrapApplication(AppComponent, {
    providers: [
        ...appConfigTaigaUI,
        importProvidersFrom(
            AppRoutingModule,
            JwtModule.forRoot({
                config: {
                    tokenGetter: () => localStorage.getItem("token"),
                    // allowedDomains: [environment.allowedDomains],
                }
            })
        ),
        provideHttpClient(
            withInterceptorsFromDi(),
            withInterceptors([ApiKeyInterceptor]),
        ),
        provideEventPlugins(),
        provideTranslateService({
            fallbackLang: 'english',
            lang: 'english',
            loader: {
                provide: TranslateLoader,
                useClass: IndexDBi18nLoader,
                deps: [HttpClient, IndexDBService]
            },
        }),
        provideZonelessChangeDetection()
    ]
}).catch(err => console.log(err));
