import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadFileGamedataComponent } from './load-file-gamedata.component';

describe('LoadFileGamedataComponent', () => {
  let component: LoadFileGamedataComponent;
  let fixture: ComponentFixture<LoadFileGamedataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoadFileGamedataComponent]
    });
    fixture = TestBed.createComponent(LoadFileGamedataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
