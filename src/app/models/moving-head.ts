import { Fixture } from './fixture';
import { EffectMapping } from './effect-mapping';

export enum MovingHeadChannel
{
    colorR,
    colorG,
    colorB,
    pan,
    tilt
}

export class MovingHead extends Fixture {

    effects: EffectMapping<MovingHeadChannel>[] = []; 

    colorR: number = 0;
    colorG: number = 0;
    colorB: number = 0;

    pan: number = 0;
    tilt: number = 0;

    constructor() {
        super();

        this.name = 'Moving Head';
    }

}
