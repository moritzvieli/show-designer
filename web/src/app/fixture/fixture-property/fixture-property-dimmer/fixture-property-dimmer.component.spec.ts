import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturePropertyDimmerComponent } from './fixture-property-dimmer.component';

describe('FixturePropertyDimmerComponent', () => {
  let component: FixturePropertyDimmerComponent;
  let fixture: ComponentFixture<FixturePropertyDimmerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturePropertyDimmerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturePropertyDimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
