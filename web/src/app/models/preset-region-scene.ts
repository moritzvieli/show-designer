import { Preset } from "./preset";
import { ScenePlaybackRegion } from "./scene-playback-region";
import { Scene } from "./scene";

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