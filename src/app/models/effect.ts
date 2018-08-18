import { UuidService } from "../services/uuid.service";

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

    constructor(private uuidService: UuidService) {
        this.uuid = this.uuidService.getUuid();

        // TODO
        this.channels.push(EffectChannel.colorR);
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        return 0;
    }

}
