import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixtureCapabilityPanTiltComponent } from './fixture-capability-pan-tilt.component';

describe('FixtureCapabilityPanTiltComponent', () => {
  let component: FixtureCapabilityPanTiltComponent;
  let fixture: ComponentFixture<FixtureCapabilityPanTiltComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureCapabilityPanTiltComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityPanTiltComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
