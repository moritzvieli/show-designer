import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureSettingsStageComponent } from './fixture-settings-stage.component';

describe('FixtureSettingsStageComponent', () => {
  let component: FixtureSettingsStageComponent;
  let fixture: ComponentFixture<FixtureSettingsStageComponent>;

  beforeEach(async(() => {
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
