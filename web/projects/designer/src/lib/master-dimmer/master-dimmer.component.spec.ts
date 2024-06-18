import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MasterDimmerComponent } from './master-dimmer.component';

describe('MasterDimmerComponent', () => {
  let component: MasterDimmerComponent;
  let fixture: ComponentFixture<MasterDimmerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MasterDimmerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterDimmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
