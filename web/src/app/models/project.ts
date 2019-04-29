import { UuidService } from "../services/uuid.service";
import { Composition } from "./composition";
import { Fixture } from "./fixture";
import { Scene } from "./scene";
import { Preset } from "./preset";

export class Project {

    public uuid: string;
    public name: string;

    public compositions: Composition[] = [];
    public fixtures: Fixture[] = [];

    // Make sure we always have at least one scene (don't allow deletion of the last scene)
    public scenes: Scene[] = [];

    presets: Preset[] = [];

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
