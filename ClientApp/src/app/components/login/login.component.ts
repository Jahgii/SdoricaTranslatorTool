import { TuiButton, TuiIcon, TuiTextfield } from "@taiga-ui/core";
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IUser } from 'src/app/core/interfaces/i-user';
import { ApiService } from 'src/app/core/services/api.service';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { TuiPassword } from "@taiga-ui/kit";
import { TranslateModule } from "@ngx-translate/core";
import { IndexDBService } from "src/app/core/services/index-db.service";
import { ObjectStoreNames } from "src/app/core/interfaces/i-indexed-db";
import { AppModes } from "src/app/core/enums/app-modes";

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    TuiTextfield,
    TuiPassword,
    TuiButton,
    TuiIcon,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fB = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly lStorage = inject(LocalStorageService);
  private readonly appState = inject(AppStateService);
  private readonly indexedDB = inject(IndexDBService);

  public loginForm = this.fB.group({
    user: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });


  protected onLogin() {
    let login = this.loginForm.getRawValue();

    firstValueFrom(this.api.post<IUser>("auth", { user: login.user, password: login.password }))
      .then(
        user => {
          this.lStorage.setToken(user.Token);
          this.appState.initializeApp();
        }, error => {

        }
      );
  }

  protected onSwitchOffline() {
    this.lStorage.setAppMode(AppModes.Offline);
    window.location.reload();
  }
}
