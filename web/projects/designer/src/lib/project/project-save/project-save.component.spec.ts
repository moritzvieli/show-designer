import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProjectSaveComponent } from './project-save.component';

describe('ProjectSaveComponent', () => {
  let component: ProjectSaveComponent;
  let fixture: ComponentFixture<ProjectSaveComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectSaveComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
