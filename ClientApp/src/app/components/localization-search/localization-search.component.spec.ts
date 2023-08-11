import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizationSearchComponent } from './localization-search.component';

describe('LocalizationSearchComponent', () => {
  let component: LocalizationSearchComponent;
  let fixture: ComponentFixture<LocalizationSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LocalizationSearchComponent]
    });
    fixture = TestBed.createComponent(LocalizationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
