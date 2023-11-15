import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportTranslationGuestComponent } from './export-translation-guest.component';

describe('ExportTranslationGuestComponent', () => {
  let component: ExportTranslationGuestComponent;
  let fixture: ComponentFixture<ExportTranslationGuestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ExportTranslationGuestComponent]
});
    fixture = TestBed.createComponent(ExportTranslationGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
