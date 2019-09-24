import { Injectable } from '@angular/core';
import { Scene } from '../models/scene';
import { UuidService } from './uuid.service';
import { EffectService } from './effect.service';
import { Preset } from '../models/preset';
import { PresetService } from './preset.service';
import { ProjectService } from './project.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  selectedScenes: Scene[] = [];
  sceneColors: string[] = [
    '#945fda',
    '#61da5f',
    '#5fc3da',
    '#dad65f',
    '#da5f5f',
    '#246db7'
  ];

  multipleSelection: boolean = false;

  sceneDeleted: Subject<void> = new Subject<void>();

  constructor(
    private uuidService: UuidService,
    private effectService: EffectService,
    private presetService: PresetService,
    private projectService: ProjectService
  ) {
  }

  sceneIsSelected(scene: Scene): boolean {
    for (let selectedScene of this.selectedScenes) {
      if (selectedScene.uuid == scene.uuid) {
        return true;
      }
    }

    return false;
  }

  presetIsSelected(preset: Preset): boolean {
    if (!this.selectedScenes || this.selectedScenes.length != 1) {
      return false;
    }

    for (let uuid of this.selectedScenes[0].presetUuids) {
      if (preset.uuid == uuid) {
        return true;
      }
    }

    return false;
  }

  switchSceneSelection(scene: Scene) {
    // Select a scene if not yet selected or unselect it otherwise
    if (this.sceneIsSelected(scene)) {
      for (let i = 0; i < this.selectedScenes.length; i++) {
        if (this.selectedScenes[i].uuid == scene.uuid) {
          this.selectedScenes.splice(i, 1);
          return;
        }
      }
    } else {
      this.selectedScenes.push(scene);
    }
  }

  selectScene(index: number) {
    this.effectService.selectedEffect = undefined;

    if (index >= this.projectService.project.scenes.length) {
      this.selectedScenes = [];
    } else {
      if (this.multipleSelection) {
        this.switchSceneSelection(this.projectService.project.scenes[index]);
      } else {
        this.selectedScenes = [];
        this.selectedScenes.push(this.projectService.project.scenes[index]);
      }
    }
    this.projectService.project.previewPreset = false;

    this.projectService.project.selectedSceneUuids = [];
    for (let scene of this.selectedScenes) {
      this.projectService.project.selectedSceneUuids.push(scene.uuid);
    }
    this.presetService.previewSelectionChanged.next();
    this.presetService.previewLive();
  }

  addScene(name?: string): void {
    let scene: Scene = new Scene();
    scene.uuid = this.uuidService.getUuid();
    scene.name = name || 'Scene 1';

    if (this.projectService.project.scenes.length < this.sceneColors.length) {
      scene.color = this.sceneColors[this.projectService.project.scenes.length];
    } else {
      scene.color = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();
    }

    // Insert the new scene before the highest currently selected scene
    let highestSelectedSceneIndex = 0;

    for (let i = 0; i < this.projectService.project.scenes.length; i++) {
      if (this.sceneIsSelected(this.projectService.project.scenes[i])) {
        highestSelectedSceneIndex = i;
        break;
      }
    }

    this.projectService.project.scenes.splice(highestSelectedSceneIndex, 0, scene);
    this.selectScene(highestSelectedSceneIndex);
  }

  removeScene(scene: Scene): void {
    // remove all playback regions
    for (let composition of this.projectService.project.compositions) {
      for (let i = composition.scenePlaybackRegions.length - 1; i >= 0; i--) {
        let compositionPlaybackRegion = composition.scenePlaybackRegions[i];
        if (compositionPlaybackRegion.sceneUuid == scene.uuid) {
          composition.scenePlaybackRegions.splice(i, 1);
        }
      }
    }

    // remove the scene
    this.projectService.project.scenes.splice(this.projectService.project.scenes.indexOf(scene), 1);
    if (this.projectService.project.scenes.length > 0) {
      this.selectScene(0);
    }

    this.sceneDeleted.next();
  }

  getSceneByUuid(uuid: string): Scene {
    for (let scene of this.projectService.project.scenes) {
      if (scene.uuid == uuid) {
        return scene;
      }
    }
  }

}
