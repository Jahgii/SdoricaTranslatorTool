import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeDarkComponent } from './theme-dark.component';

describe('ThemeDarkComponent', () => {
  let component: ThemeDarkComponent;
  let fixture: ComponentFixture<ThemeDarkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ThemeDarkComponent]
    });
    fixture = TestBed.createComponent(ThemeDarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
