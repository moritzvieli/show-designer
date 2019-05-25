import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureCapabilityGenericComponent } from './fixture-capability-generic.component';

describe('FixtureCapabilityGenericComponent', () => {
  let component: FixtureCapabilityGenericComponent;
  let fixture: ComponentFixture<FixtureCapabilityGenericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixtureCapabilityGenericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureCapabilityGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
