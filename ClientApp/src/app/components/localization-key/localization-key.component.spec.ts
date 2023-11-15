import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalizationKeyComponent } from './localization-key.component';

describe('LocalizationKeyComponent', () => {
  let component: LocalizationKeyComponent;
  let fixture: ComponentFixture<LocalizationKeyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LocalizationKeyComponent]
});
    fixture = TestBed.createComponent(LocalizationKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
