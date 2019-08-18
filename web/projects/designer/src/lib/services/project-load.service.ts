import { Injectable } from '@angular/core';
import { ProjectService } from './project.service';
import { PreviewService } from './preview.service';
import { FixtureService } from './fixture.service';
import { PresetService } from './preset.service';
import { SceneService } from './scene.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BsModalService } from 'ngx-bootstrap';
import { WaitDialogComponent } from '../wait-dialog/wait-dialog.component';
import { Project } from '../models/project';
import { Preset } from '../models/preset';
import { UuidService } from './uuid.service';

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
    private modalService: BsModalService,
    private uuidService: UuidService
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

      setTimeout(() => {
        ref.hide();
      }, 0);
    }));
  }

  new() {
    let project = new Project();
    project.name = 'New Project';
    this.projectService.project = project;

    // Add a default scene and preset
    this.sceneService.addScene();

    let preset = new Preset();
    preset.uuid = this.uuidService.getUuid();
    preset.name = 'Preset';
    this.projectService.project.scenes[0].presetUuids.push(preset.uuid);

    this.projectService.project.presets.push(preset);
    this.presetService.selectPreset(0);
    this.projectService.project.previewPreset = true;

    this.afterLoad();
  }

}
