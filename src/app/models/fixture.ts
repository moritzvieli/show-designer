import { UuidService } from '../services/uuid.service';
import { FixtureMode } from './fixture-mode';

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
    universeUuid: string;
    firstChannel: number = 5;
    modeUuid: string;
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
