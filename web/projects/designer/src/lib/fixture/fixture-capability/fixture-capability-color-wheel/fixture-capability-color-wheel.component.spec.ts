import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureCapabilityColorWheelComponent } from './fixture-capability-color-wheel.component';

describe('FixtureCapabilityColorWheelComponent', () => {
  let component: FixtureCapabilityColorWheelComponent;
  let fixture: ComponentFixture<FixtureCapabilityColorWheelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureCapabilityColorWheelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityColorWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
