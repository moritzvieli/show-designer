import { Injectable } from '@angular/core';
import { Scene } from '../models/scene';
import { Subject } from 'rxjs';
import { Fixture } from '../models/fixture';
import { SceneFixtureProperties } from '../models/scene-fixture-properties';
import { ScenePlaybackRegion } from '../models/scene-playback-region';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // Make sure we always have at least one scene (don't allow deletion of the last scene)
  scenes: Scene[] = [];

  // Fires, when the current scene has changed
  currentSceneChanged: Subject<void> = new Subject<void>();

  constructor() {
    let scene = new Scene();
    scene.name = 'Main';
    scene.isSelected = true;
    this.scenes.push(scene);
  }

  getSelectedScenes(): Scene[] {
    let selectedScenes: Scene[] = [];

    for (let scene of this.scenes) {
      if (scene.isSelected) {
        selectedScenes.push(scene);
      }
    }

    return selectedScenes;
  }

  getCurrentPlaybackRegion(scene: Scene, timeMillis: number): ScenePlaybackRegion {
    // Return true, if the specified scene is active during the specified time
    for(let region of scene.scenePlaybackRegionList){
      if(region.startMillis <= timeMillis && region.endMillis >= timeMillis) {
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

  hasfixturePropertiesInScene(scene: Scene, fixture: Fixture) {
    for (let sceneFixtureProperties of scene.sceneFixturePropertiesList) {
      if (sceneFixtureProperties.fixture.uuid == fixture.uuid) {
        return true;
      }
    }

    return false;
  }

  getSelectedScenesFixtureProperties(fixture: Fixture): SceneFixtureProperties[] {
    let sceneFixturePropertiesList: SceneFixtureProperties[] = []

    // Get the scene fixture properties for the provided fixture or create the entries
    for (let scene of this.getSelectedScenes()) {
      let fixturePropertyFound: boolean = false;

      for (let sceneFixtureProperties of scene.sceneFixturePropertiesList) {
        if (sceneFixtureProperties.fixture.uuid == fixture.uuid) {
          fixturePropertyFound = true;
          sceneFixturePropertiesList.push(sceneFixtureProperties);
          break;
        }
      }

      if (!fixturePropertyFound) {
        // No existing entry -> create a new one
        let sceneFixtureProperties = new SceneFixtureProperties();
        sceneFixtureProperties.fixture = fixture;
        // Create a new instance of fixture
        sceneFixtureProperties.properties = new (fixture.constructor as any);
        scene.sceneFixturePropertiesList.push(sceneFixtureProperties);
        sceneFixturePropertiesList.push(sceneFixtureProperties);
      }
    }

    return sceneFixturePropertiesList;
  }

}
