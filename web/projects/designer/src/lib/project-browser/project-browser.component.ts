import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project';
import { PreviewService } from '../services/preview.service';
import { FixtureService } from '../services/fixture.service';
import { PresetService } from '../services/preset.service';
import { SceneService } from '../services/scene.service';
import { ProjectLoadService } from '../services/project-load.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'lib-project-browser',
  templateUrl: './project-browser.component.html',
  styleUrls: ['./project-browser.component.css']
})
export class ProjectBrowserComponent implements OnInit {

  projects: Project[] = [];
  loading: boolean = true;

  constructor(
    private bsModalRef: BsModalRef,
    private projectService: ProjectService,
    private projectLoadService: ProjectLoadService,
    private userService: UserService
  ) {
    this.loadProjects();
  }

  private loadProjects() {
    this.projectService.getAllProjects().subscribe(projects => {
      this.projects = projects;
      this.loading = false;
    });
  }

  ngOnInit() {
  }

  cancel() {
    this.bsModalRef.hide()
  }

  openProject(project: Project) {
    this.bsModalRef.hide();
    this.projectLoadService.load(project.id).subscribe(() => {
      this.userService.setAutoLoadProjectId(project.id);
    });
  }

  deleteProject(project: Project) {
    this.projectService.deleteProject(project).subscribe(projects => {
      this.loadProjects();
    });
  }

}
