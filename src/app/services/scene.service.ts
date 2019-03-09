import { Injectable } from '@angular/core';
import { Scene } from '../models/scene';
import { Subject } from 'rxjs';
import { ScenePlaybackRegion } from '../models/scene-playback-region';
import { UuidService } from './uuid.service';
import { EffectService } from './effect.service';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // Make sure we always have at least one scene (don't allow deletion of the last scene)
  scenes: Scene[] = [];

  selectedScenes: Scene[] = [];

  multipleSelection: boolean = false;

  // Fires, when the current scene has changed
  currentSceneChanged: Subject<void> = new Subject<void>();

  constructor(
    private uuidService: UuidService,
    private effectService: EffectService
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

  getCurrentPlaybackRegion(scene: Scene, timeMillis: number): ScenePlaybackRegion {
    // Return true, if the specified scene is active during the specified time
    for (let region of scene.scenePlaybackRegionList) {
      if (region.startMillis <= timeMillis && region.endMillis >= timeMillis) {
        return region;
      }
    }

    return undefined;
  }

  getScenesInTime(timeMillis: number): Scene[] {
    // Return all scenes which should be active during the specified time
    let activeScenes: Scene[] = [];

    for (let scene of this.scenes) {
      if (this.getCurrentPlaybackRegion(scene, timeMillis)) {
        activeScenes.push(scene);
      }
    }

    return activeScenes;
  }

  selectScene(index: number) {
    this.effectService.selectedEffect = undefined;

    if (this.multipleSelection) {
      this.switchSceneSelection(this.scenes[index]);
    } else {
      this.selectedScenes = [];
      this.selectedScenes.push(this.scenes[index]);
    }

    this.currentSceneChanged.next();
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
