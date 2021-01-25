import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureCapabilityComponent } from './fixture-capability.component';

describe('PropertyComponent', () => {
  let component: FixtureCapabilityComponent;
  let fixture: ComponentFixture<FixtureCapabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureCapabilityComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
