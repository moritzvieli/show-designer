import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixtureSettingsComponent } from './fixture-settings.component';

describe('FixtureSettingsComponent', () => {
  let component: FixtureSettingsComponent;
  let fixture: ComponentFixture<FixtureSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
