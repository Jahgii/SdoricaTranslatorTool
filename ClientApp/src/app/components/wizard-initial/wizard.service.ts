import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WizardService {
  public stepIndex$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  private urlRegex = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  public modeForm: FormGroup = this.fB.group({
    mode: [null, [Validators.required]],
    apiUrl: '',
    apiKey: ''
  });

  constructor(private fB: FormBuilder) { }
  
}
