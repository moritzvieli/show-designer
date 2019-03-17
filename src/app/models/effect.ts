import { UuidService } from "../services/uuid.service";

export enum EffectChannel
{
    colorRed,
    colorGreen,
    colorBlue,
    // TODO
    // hue,
    // saturation,
    // dimmer,
    pan,
    tilt
}

export class Effect {

    uuid: string;
    effectChannels: EffectChannel[] = [];
    paused: boolean = false;

    constructor(private uuidService: UuidService) {
        this.uuid = this.uuidService.getUuid();
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        return 0;
    }

}
