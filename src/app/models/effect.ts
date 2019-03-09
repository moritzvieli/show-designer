import { UuidService } from "../services/uuid.service";

export enum EffectChannel
{
    colorRed,
    colorGreen,
    colorBlue,
    hue,
    saturation,
    dimmer,
    pan,
    tilt
}

export class Effect {

    uuid: string;
    effectChannel: EffectChannel;
    paused: boolean = false;

    constructor(private uuidService: UuidService) {
        this.uuid = this.uuidService.getUuid();
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        return 0;
    }

}
