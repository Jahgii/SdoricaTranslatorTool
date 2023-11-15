import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFileWizardUploadingComponent } from './load-file-wizard-uploading.component';

describe('LoadFileWizardUploadingComponent', () => {
  let component: LoadFileWizardUploadingComponent;
  let fixture: ComponentFixture<LoadFileWizardUploadingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LoadFileWizardUploadingComponent]
});
    fixture = TestBed.createComponent(LoadFileWizardUploadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
