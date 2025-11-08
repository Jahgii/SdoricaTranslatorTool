import { inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WizardService {
  private readonly fB = inject(FormBuilder);

  public readonly stepIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private readonly urlRegex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  public readonly modeForm: FormGroup = this.fB.group({
    mode: [null, [Validators.required]],
    apiUrl: '',
    apiKey: ''
  });

}
