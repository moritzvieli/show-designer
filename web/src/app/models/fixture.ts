import { UuidService } from '../services/uuid.service';
import { FixturePropertyValue } from './fixture-property-value';

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

    // Default channel values
    fixturePropertyValues: FixturePropertyValue[] = [];

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
