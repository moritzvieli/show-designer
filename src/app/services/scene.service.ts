import { Injectable } from '@angular/core';
import { Scene } from '../models/scene';
import { ScenePlaybackRegion } from '../models/scene-playback-region';
import { UuidService } from './uuid.service';
import { EffectService } from './effect.service';
import { Preset } from '../models/preset';
import { PresetService } from './preset.service';

export class PresetRegionScene {

  preset: Preset;
  region: ScenePlaybackRegion;
  scene: Scene;

  constructor(preset: Preset, region: ScenePlaybackRegion, scene: Scene) {
    this.preset = preset;
    this.region = region;
    this.scene = scene;
  }

}

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // Make sure we always have at least one scene (don't allow deletion of the last scene)
  scenes: Scene[] = [];

  selectedScenes: Scene[] = [];

  multipleSelection: boolean = false;

  constructor(
    private uuidService: UuidService,
    private effectService: EffectService,
    private presetService: PresetService
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
    if (!this.selectedScenes || this.selectedScenes.length > 1) {
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

  getPresetsInTime(timeMillis: number): PresetRegionScene[] {
    // Return all scenes which should be active during the specified time
    let activePresets: PresetRegionScene[] = [];

    for (let scene of this.scenes) {
      for (let region of scene.scenePlaybackRegionList) {
        if (region.startMillis <= timeMillis && region.endMillis >= timeMillis) {
          // This region is currently being played -> check all scene presets
          for (let presetUuid of scene.presetUuids) {
            let preset = this.presetService.getPresetByUuid(presetUuid);

            if ((!preset.startMillis || preset.startMillis + region.startMillis <= timeMillis)
              && (!preset.endMillis || preset.endMillis + region.startMillis >= timeMillis)) {

              activePresets.push(new PresetRegionScene(preset, region, scene));
            }
          }
        }
      }
    }

    return activePresets;
  }

  selectScene(index: number) {
    this.effectService.selectedEffect = undefined;

    if (this.multipleSelection) {
      this.switchSceneSelection(this.scenes[index]);
    } else {
      this.selectedScenes = [];
      this.selectedScenes.push(this.scenes[index]);
    }

    this.presetService.previewSelectionChanged.next();
  }

  addScene(name?: string): void {
    let scene: Scene = new Scene(this.uuidService);
    scene.name = name || 'Main';

    // Insert the new scene before the highest currently selected scene
    let highestSelectedSceneIndex = 0;

    for (let i = 0; i < this.scenes.length; i++) {
      if (this.sceneIsSelected(this.scenes[i])) {
        highestSelectedSceneIndex = i;
        break;
      }
    }

    this.scenes.splice(highestSelectedSceneIndex, 0, scene);

    this.selectScene(highestSelectedSceneIndex);
  }

}
