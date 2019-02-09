import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EffectCurveComponent } from './effect-curve.component';

describe('EffectCurveComponent', () => {
  let component: EffectCurveComponent;
  let fixture: ComponentFixture<EffectCurveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EffectCurveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectCurveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
