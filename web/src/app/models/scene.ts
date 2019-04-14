import { ScenePlaybackRegion } from "./scene-playback-region";
import { UuidService } from "../services/uuid.service";

export class Scene {

    uuid: string;
    name: string;

    color: string;

    // All contained presets
    presetUuids: string[] = [];

    // Regions, where the scene will be played
    scenePlaybackRegionList: ScenePlaybackRegion[] = [];

    // Fading times
    fadeInMillis: number = 2000;
    fadeOutMillis: number = 2000;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }

        this.color = '#' + Math.random().toString(16).slice(2, 8).toUpperCase();;
    }

}
