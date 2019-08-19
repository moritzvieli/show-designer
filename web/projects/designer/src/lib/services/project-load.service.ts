import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { PreviewService } from './preview.service';
import { FixtureService } from './fixture.service';
import { PresetService } from './preset.service';
import { SceneService } from './scene.service';
import { map, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';
import { Project } from '../models/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectLoadService {


  constructor(
    private projectService: ProjectService,
    private previewService: PreviewService,
    private fixtureService: FixtureService,
    private presetService: PresetService,
    private sceneService: SceneService,
    private modalService: BsModalService
  ) { }

  private afterLoad() {
    this.fixtureService.updateCachedFixtures();
    this.presetService.removeDeletedFixtures();
    this.previewService.updateFixtureSetup();
    this.presetService.fixtureSelectionChanged.next();
  }

  load(id: number): Observable<void> {
    let ref = this.modalService.show(WaitDialogComponent, { keyboard: false, ignoreBackdropClick: true });

    return this.projectService.getProject(id).pipe(map(project => {
      this.projectService.project = project;

      this.presetService.selectedPreset = this.presetService.getPresetByUuid(this.projectService.project.selectedPresetUuid);
      this.sceneService.selectedScenes = [];
      for (let uuid of this.projectService.project.selectedSceneUuids) {
        this.sceneService.selectedScenes.push(this.sceneService.getSceneByUuid(uuid));
      }

      this.afterLoad();
    }), finalize(() => {
      // hide the modal again because of:
      // https://github.com/valor-software/ngx-bootstrap/issues/3711
      setTimeout(() => {
        ref.hide();
      }, 250);
      setTimeout(() => {
        ref.hide();
      }, 500);
      setTimeout(() => {
        ref.hide();
      }, 1500);
    }));
  }

  new() {
    // create an empty new project
    let project = new Project();
    project.name = 'New Project';
    this.projectService.project = project;
    this.sceneService.selectedScenes = [];
    this.presetService.selectedPreset = null;
    this.afterLoad();
  }

  template() {
    // load the template project with id 1
    this.load(1).subscribe(() => {
      this.projectService.project.id = undefined;
    });
  }

}
