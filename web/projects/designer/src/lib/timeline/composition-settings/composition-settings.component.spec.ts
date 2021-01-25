import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompositionSettingsComponent } from './composition-settings.component';

describe('CompositionSettingsComponent', () => {
  let component: CompositionSettingsComponent;
  let fixture: ComponentFixture<CompositionSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompositionSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompositionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
