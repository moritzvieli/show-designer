import { UuidService } from '../services/uuid.service';
import { Universe } from './universe';

export enum Positioning {
    topFront,
    topBack,
    bottomFront,
    bottomBack,
    manual
}

export class Fixture {

    uuid: string;
    fixtureTemplateUuid: string;
    name: string;
    universe: Universe;
    firstChannel: number = 5;
    positioning: Positioning = Positioning.topFront;

    // Only relevant when positioning = manual
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
