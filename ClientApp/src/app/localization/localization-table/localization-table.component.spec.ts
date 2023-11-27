import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizationTableComponent } from './localization-table.component';

describe('LocalizationTableComponent', () => {
  let component: LocalizationTableComponent;
  let fixture: ComponentFixture<LocalizationTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LocalizationTableComponent]
});
    fixture = TestBed.createComponent(LocalizationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
