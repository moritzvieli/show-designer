import { UuidService } from '../services/uuid.service';

export enum Positioning {
    topFront,
    topBack,
    bottomFront,
    bottomBack,
    manual
}

export class Fixture {

    uuid: string;
    name: string;
    isSelected: boolean = false;

    // Only relevant when positioning = manual
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    positioning: Positioning = Positioning.topFront;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
