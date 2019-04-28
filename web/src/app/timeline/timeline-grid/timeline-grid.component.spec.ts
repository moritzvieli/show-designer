import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineGridComponent } from './timeline-grid.component';

describe('TimelineGridComponent', () => {
  let component: TimelineGridComponent;
  let fixture: ComponentFixture<TimelineGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
