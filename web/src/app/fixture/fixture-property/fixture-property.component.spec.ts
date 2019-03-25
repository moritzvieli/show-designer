import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturePropertyComponent } from './fixture-property.component';

describe('PropertyComponent', () => {
  let component: FixturePropertyComponent;
  let fixture: ComponentFixture<FixturePropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturePropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturePropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
