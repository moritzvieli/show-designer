import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixturePoolComponent } from './fixture-pool.component';

describe('FixturePoolComponent', () => {
  let component: FixturePoolComponent;
  let fixture: ComponentFixture<FixturePoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixturePoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixturePoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
