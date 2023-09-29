import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { translationLanguageGuard } from './translation-language.guard';

describe('translationLanguageGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => translationLanguageGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
