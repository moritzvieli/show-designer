import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureCapabilityColorComponent } from './fixture-capability-color.component';

describe('ColorComponent', () => {
  let component: FixtureCapabilityColorComponent;
  let fixture: ComponentFixture<FixtureCapabilityColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureCapabilityColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
