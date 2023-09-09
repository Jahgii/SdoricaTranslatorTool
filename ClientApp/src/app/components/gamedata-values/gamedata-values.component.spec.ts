import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedataValuesComponent } from './gamedata-values.component';

describe('GamedataValuesComponent', () => {
  let component: GamedataValuesComponent;
  let fixture: ComponentFixture<GamedataValuesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GamedataValuesComponent]
    });
    fixture = TestBed.createComponent(GamedataValuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
