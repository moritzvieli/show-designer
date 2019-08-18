import { Injectable } from '@angular/core';
import { Scene } from '../models/scene';
import { UuidService } from './uuid.service';
import { EffectService } from './effect.service';
import { Preset } from '../models/preset';
import { PresetService } from './preset.service';
import { ProjectService } from './project.service';

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
    '#da5f5f'
  ];

  multipleSelection: boolean = false;

  constructor(
    private uuidService: UuidService,
    private effectService: EffectService,
    private presetService: PresetService,
    private projectService: ProjectService,
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
  }

  addScene(name?: string): void {
    let scene: Scene = new Scene();
    scene.uuid = this.uuidService.getUuid();
    scene.name = name || 'Main';

    if (this.projectService.project.scenes.length <= this.sceneColors.length) {
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

  getSceneByUuid(uuid: string): Scene {
    for (let scene of this.projectService.project.scenes) {
      if (scene.uuid == uuid) {
        return scene;
      }
    }
  }

}
