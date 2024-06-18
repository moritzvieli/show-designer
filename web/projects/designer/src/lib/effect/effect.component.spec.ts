import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EffectComponent } from './effect.component';

describe('EffectComponent', () => {
  let component: EffectComponent;
  let fixture: ComponentFixture<EffectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EffectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EffectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
