import { ScenePlaybackRegion } from "./scene-playback-region";

export class Scene {

    uuid: string;
    name: string;

    color: string = '#fff';

    // All contained presets
    presetUuids: string[] = [];

    // Fading times
    fadeInMillis: number = 0;
    fadeOutMillis: number = 0;

    // fade in/out outside the start/end times?
    fadeInPre: boolean = false;
    fadeOutPost: boolean = false;

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.uuid = data.uuid;
        this.name = data.name;
        this.color = data.color;
        if (data.presetUuids) {
            this.presetUuids = data.presetUuids;
        }
        this.fadeInMillis = data.fadeInMillis;
        this.fadeOutMillis = data.fadeOutMillis;
        this.fadeInPre = data.fadeInPre;
        this.fadeOutPost = data.fadeOutPost;
    }

}
