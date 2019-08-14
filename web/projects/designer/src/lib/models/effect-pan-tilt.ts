import { Effect } from './effect';

export class EffectPanTilt extends Effect {

    phasingMillis = 0;

    constructor(data?: any) {
        super('pan-tilt', data);
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if (fixtureIndex) {
            phasingIndex = fixtureIndex;
        }

        // let phase = this.phaseMillis + phasingIndex * this.phasingMillis;

        // Calculate the value according to the curve
        // TODO

        return 0;
    }

}
