import { UuidService } from '../services/uuid.service';

export class Universe {

    uuid: string;
    name: string;
    channelValues: number[] = [];

    // TODO Add output configuration

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
