import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFileWizardGroupsComponent } from './load-file-wizard-groups.component';

describe('LoadFileWizardGroupsComponent', () => {
  let component: LoadFileWizardGroupsComponent;
  let fixture: ComponentFixture<LoadFileWizardGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LoadFileWizardGroupsComponent]
});
    fixture = TestBed.createComponent(LoadFileWizardGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
