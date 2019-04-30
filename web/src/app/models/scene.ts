import { ScenePlaybackRegion } from "./scene-playback-region";

export class Scene {

    uuid: string;
    name: string;

    color: string = '#fff';

    // All contained presets
    presetUuids: string[] = [];

    // Regions, where the scene will be played
    scenePlaybackRegionList: ScenePlaybackRegion[] = [];

    // Fading times
    fadeInMillis: number = 2000;
    fadeOutMillis: number = 2000;

    constructor() {
    }

}
