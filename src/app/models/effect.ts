import { UuidService } from "../services/uuid.service";
import { FixturePropertyType } from "./fixture-property";

export enum EffectChannel
{
    colorR,
    colorG,
    colorB,
    pan,
    tilt
}

export class Effect {

    uuid: string;
    fixturePropertyTypes: FixturePropertyType[] = [];
    paused: boolean = false;

    constructor(private uuidService: UuidService) {
        this.uuid = this.uuidService.getUuid();
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        return 0;
    }

}
