import { Injectable } from '@angular/core';
import { Scene } from '../models/scene';

@Injectable({
  providedIn: 'root'
})
export class SceneService {

  // Make sure we always have at least one scene (don't allow deletion of the last scene)
  scenes: Scene[] = [];
  currentSceneIndex: number = 0;

  constructor() {
    let scene = new Scene();
    scene.name = 'Main';
    this.scenes.push(scene);
  }

  getCurrentScene(): Scene {
    return this.scenes[this.currentSceneIndex];
  }

}
