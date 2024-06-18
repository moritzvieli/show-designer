import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProjectBrowserComponent } from './project-browser.component';

describe('ProjectBrowserComponent', () => {
  let component: ProjectBrowserComponent;
  let fixture: ComponentFixture<ProjectBrowserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectBrowserComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
