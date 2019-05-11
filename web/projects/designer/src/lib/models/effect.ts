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

export abstract class Effect {

    uuid: string;
    effectChannels: EffectChannel[] = [];
    type: string;

    constructor(type: string) {
        this.type = type;
    }

    abstract getValueAtMillis(timeMillis: number, fixtureIndex?: number): number;

}
