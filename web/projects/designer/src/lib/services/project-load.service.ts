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
import { Preset } from '../models/preset';
import { UuidService } from './uuid.service';
import { TimelineService } from './timeline.service';

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
    private uuidService: UuidService,
    private timelineService: TimelineService
  ) { }

  private afterLoad() {
    this.fixtureService.updateCachedFixtures();
    this.presetService.removeDeletedFixtures();
    this.previewService.updateFixtureSetup();
    this.presetService.fixtureSelectionChanged.next();
  }

  private selectScenesPresetComposition() {
    this.presetService.selectedPreset = this.presetService.getPresetByUuid(this.projectService.project.selectedPresetUuid);
    this.sceneService.selectedScenes = [];
    if (this.projectService.project.selectedSceneUuids) {
      for (let uuid of this.projectService.project.selectedSceneUuids) {
        this.sceneService.selectedScenes.push(this.sceneService.getSceneByUuid(uuid));
      }
    }
    for (let i = 0; i < this.projectService.project.compositions.length; i++) {
      if (this.projectService.project.compositions[i].uuid == this.projectService.project.selectedCompositionUuid) {
        this.timelineService.selectCompositionIndex(i);
        break;
      }
    }
  }

  load(id: number): Observable<void> {
    let ref = this.modalService.show(WaitDialogComponent, { keyboard: false, ignoreBackdropClick: true });

    return this.projectService.getProject(id).pipe(map(project => {
      this.projectService.project = project;
      this.selectScenesPresetComposition();
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
    this.projectService.project.shareToken = this.uuidService.getUuid();

    // Add a default scene and preset
    let preset = new Preset();
    preset.uuid = this.uuidService.getUuid();
    preset.name = 'Preset';
    this.projectService.project.presets.push(preset);
    this.presetService.selectPreset(0);

    this.sceneService.addScene();
    this.projectService.project.scenes[0].presetUuids.push(preset.uuid);

    this.projectService.project.previewPreset = true;

    this.sceneService.selectedScenes = [this.projectService.project.scenes[0]];
    this.presetService.selectedPreset = this.projectService.project.presets[0];

    this.afterLoad();
  }

  template() {
    // load the template project with id 1
    this.load(1).subscribe(() => {
      this.projectService.project.id = undefined;
    });
  }

  import(data: string) {
    // import a project from a string
    let project = new Project(JSON.parse(data));
    project.id = undefined;
    this.projectService.project = project;

    this.selectScenesPresetComposition();
    this.afterLoad();
  }

}
