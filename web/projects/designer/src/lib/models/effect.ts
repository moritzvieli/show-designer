import { UuidService } from "../services/uuid.service";

export enum EffectChannel
{
    colorRed = "colorRed",
    colorGreen = "colorGreen",
    colorBlue = "colorBlue",
    // TODO
    // hue,
    // saturation,
    dimmer = "dimmer",
    pan = "pan",
    tilt = "tilt"
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
