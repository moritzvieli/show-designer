import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SceneSettingsComponent } from './scene-settings.component';

describe('SceneSettingsComponent', () => {
  let component: SceneSettingsComponent;
  let fixture: ComponentFixture<SceneSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SceneSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SceneSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
