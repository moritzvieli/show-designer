import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureCapabilityChannelComponent } from './fixture-capability-channel.component';

describe('FixtureCapabilityChannelComponent', () => {
  let component: FixtureCapabilityChannelComponent;
  let fixture: ComponentFixture<FixtureCapabilityChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureCapabilityChannelComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
