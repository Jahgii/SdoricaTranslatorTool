import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadObbFileExportComponent } from './load-obb-file-export.component';

describe('LoadObbFileExportComponent', () => {
  let component: LoadObbFileExportComponent;
  let fixture: ComponentFixture<LoadObbFileExportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadObbFileExportComponent]
    });
    fixture = TestBed.createComponent(LoadObbFileExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
