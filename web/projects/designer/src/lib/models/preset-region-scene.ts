import { Preset } from './preset';
import { Scene } from './scene';
import { ScenePlaybackRegion } from './scene-playback-region';

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
