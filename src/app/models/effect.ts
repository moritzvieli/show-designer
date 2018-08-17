import { UuidService } from "../services/uuid.service";

export class Effect {

    uuid: string;
    paused: boolean = false;

    constructor(private uuidService: UuidService) {
        this.uuid = this.uuidService.getUuid();
    }

}
