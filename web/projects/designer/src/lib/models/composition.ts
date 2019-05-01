import { ScenePlaybackRegion } from "./scene-playback-region";

export class Composition {

    uuid: string;
    name: string;

    // none or audio
    syncType: string = 'audio';

    // if no sync
    durationMillis: number = 0;

    // Regions, where the scene will be played
    scenePlaybackRegions: ScenePlaybackRegion[] = [];

    constructor() {
    }

}
