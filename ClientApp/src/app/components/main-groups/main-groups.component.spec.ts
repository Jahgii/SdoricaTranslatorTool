import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGroupsComponent } from './main-groups.component';

describe('MainGroupsComponent', () => {
  let component: MainGroupsComponent;
  let fixture: ComponentFixture<MainGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainGroupsComponent]
    });
    fixture = TestBed.createComponent(MainGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
