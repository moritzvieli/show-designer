import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixtureComponent } from './fixture.component';

describe('FixtureComponent', () => {
  let component: FixtureComponent;
  let fixture: ComponentFixture<FixtureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
