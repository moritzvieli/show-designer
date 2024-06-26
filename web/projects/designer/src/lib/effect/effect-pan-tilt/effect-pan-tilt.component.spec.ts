import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EffectPanTiltComponent } from './effect-pan-tilt.component';

describe('EffectPanTiltComponent', () => {
  let component: EffectPanTiltComponent;
  let fixture: ComponentFixture<EffectPanTiltComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EffectPanTiltComponent],
    }).compileComponents();
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
