import { UuidService } from '../services/uuid.service';

export class Universe {

    uuid: string;
    name: string;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
