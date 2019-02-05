import { UuidService } from "../services/uuid.service";
import { Fixture } from "./fixture";

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
    channels: EffectChannel[] = [];
    paused: boolean = false;
    fixtures: Fixture[] = [];

    constructor(private uuidService: UuidService) {
        this.uuid = this.uuidService.getUuid();
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        return 0;
    }

}
