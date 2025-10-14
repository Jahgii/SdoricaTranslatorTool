import { TuiInputModule, TuiInputPasswordModule } from "@taiga-ui/legacy";
import { TuiButton } from "@taiga-ui/core";
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IUser } from 'src/app/core/interfaces/i-user';
import { ApiService } from 'src/app/core/services/api.service';
import { AppStateService } from 'src/app/core/services/app-state.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';

@Component({
    selector: 'app-login',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TuiInputModule,
        TuiInputPasswordModule,
        TuiButton
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
  public loginForm = this.fB.group({
    user: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  constructor(
    private fB: FormBuilder,
    private api: ApiService,
    private lStorage: LocalStorageService,
    private appState: AppStateService
  ) { }

  public onLogin() {
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
}
