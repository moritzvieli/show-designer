import { Fixture } from './fixture';
import { EffectMapping } from './effect-mapping';
import { IFixture } from './i-fixture';

export enum MovingHeadChannel
{
    colorR,
    colorG,
    colorB,
    pan,
    tilt
}

export class MovingHead extends Fixture {

    effectMappings: EffectMapping<MovingHeadChannel>[] = []; 

    colorR: number = 0;
    colorG: number = 0;
    colorB: number = 0;

    pan: number = 127;
    tilt: number = 127;

    maxPanDegrees: number = 540;
    maxTiltDegrees: number = 270;

    beamAngleDegrees: number = 14;

    constructor() {
        super();

        this.name = 'Moving Head';
    }

    getEffectMappings(): EffectMapping<MovingHeadChannel>[] {
        return this.effectMappings;
    }

}
