import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFileLocalizationComponent } from './load-file-localization.component';

describe('LoadFileLocalizationComponent', () => {
  let component: LoadFileLocalizationComponent;
  let fixture: ComponentFixture<LoadFileLocalizationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [LoadFileLocalizationComponent]
});
    fixture = TestBed.createComponent(LoadFileLocalizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
