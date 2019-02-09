import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturePropertyColorComponent } from './fixture-property-color.component';

describe('ColorComponent', () => {
  let component: FixturePropertyColorComponent;
  let fixture: ComponentFixture<FixturePropertyColorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturePropertyColorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturePropertyColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
