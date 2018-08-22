import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectPanTiltComponent } from './effect-pan-tilt.component';

describe('EffectPanTiltComponent', () => {
  let component: EffectPanTiltComponent;
  let fixture: ComponentFixture<EffectPanTiltComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectPanTiltComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectPanTiltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
