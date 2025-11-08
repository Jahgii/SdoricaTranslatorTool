import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { LanguageOriginService } from '../services/language-origin.service';

export const translationLanguageGuard: CanActivateFn = (route, state) => {
  const languageOrigin = inject(LanguageOriginService);

  if (languageOrigin.language$.value) {
    return true;
  }

  return false;
};
