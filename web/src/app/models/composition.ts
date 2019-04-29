import { UuidService } from "../services/uuid.service";

export class Composition {

    uuid: string;
    name: string;

    // none or audio
    syncType: string = 'audio';

    // if no sync
    durationMillis: number = 0;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
