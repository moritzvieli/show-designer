import { UuidService } from "../services/uuid.service";

export class Composition {

    uuid: string;
    name: string

    // free or audio
    syncType: string;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
