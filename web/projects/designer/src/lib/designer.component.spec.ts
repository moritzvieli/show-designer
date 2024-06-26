import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DesignerComponent } from './designer.component';

describe('DesignerComponent', () => {
  let component: DesignerComponent;
  let fixture: ComponentFixture<DesignerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DesignerComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
