import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixtureCapabilityDimmerComponent } from './fixture-capability-dimmer.component';

describe('FixturePropertyDimmerComponent', () => {
  let component: FixtureCapabilityDimmerComponent;
  let fixture: ComponentFixture<FixtureCapabilityDimmerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureCapabilityDimmerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityDimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
