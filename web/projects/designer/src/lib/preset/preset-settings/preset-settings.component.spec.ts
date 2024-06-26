import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PresetSettingsComponent } from './preset-settings.component';

describe('PresetSettingsComponent', () => {
  let component: PresetSettingsComponent;
  let fixture: ComponentFixture<PresetSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PresetSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PresetSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
