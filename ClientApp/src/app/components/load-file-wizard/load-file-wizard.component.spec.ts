import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFileWizardComponent } from './load-file-wizard.component';

describe('LoadFileWizardComponent', () => {
  let component: LoadFileWizardComponent;
  let fixture: ComponentFixture<LoadFileWizardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadFileWizardComponent]
    });
    fixture = TestBed.createComponent(LoadFileWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
