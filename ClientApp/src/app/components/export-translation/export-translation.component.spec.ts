import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportTranslationComponent } from './export-translation.component';

describe('ExportTranslationComponent', () => {
  let component: ExportTranslationComponent;
  let fixture: ComponentFixture<ExportTranslationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExportTranslationComponent]
    });
    fixture = TestBed.createComponent(ExportTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
