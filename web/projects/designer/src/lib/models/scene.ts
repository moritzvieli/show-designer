import { ScenePlaybackRegion } from "./scene-playback-region";

export class Scene {

    uuid: string;
    name: string;

    color: string = '#fff';

    // All contained presets
    presetUuids: string[] = [];

    // Fading times
    fadeInMillis: number = 2000;
    fadeOutMillis: number = 2000;

    constructor() {
    }

}
