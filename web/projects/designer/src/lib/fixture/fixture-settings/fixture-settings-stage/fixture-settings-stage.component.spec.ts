import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixtureSettingsStageComponent } from './fixture-settings-stage.component';

describe('FixtureSettingsStageComponent', () => {
  let component: FixtureSettingsStageComponent;
  let fixture: ComponentFixture<FixtureSettingsStageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FixtureSettingsStageComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixtureSettingsStageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
