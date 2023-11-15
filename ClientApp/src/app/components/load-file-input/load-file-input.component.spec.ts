import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFileInputComponent } from './load-file-input.component';

describe('LoadFileInputComponent', () => {
  let component: LoadFileInputComponent;
  let fixture: ComponentFixture<LoadFileInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LoadFileInputComponent]
});
    fixture = TestBed.createComponent(LoadFileInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
