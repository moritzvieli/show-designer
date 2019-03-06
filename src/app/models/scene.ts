import { ScenePlaybackRegion } from "./scene-playback-region";
import { Preset } from "./preset";
import { UuidService } from "../services/uuid.service";

export class Scene {

    uuid: string;
    name: string;

    // All contained presets
    presets: Preset[] = [];

    // Regions, where the scene will be played
    scenePlaybackRegionList: ScenePlaybackRegion[] = [];

    // Fading times
    fadeInMillis: number = 200;
    fadeOutMillis: number = 200;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
