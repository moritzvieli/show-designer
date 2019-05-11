import { Effect } from './effect';

export class EffectCurve extends Effect {

    lengthMillis = 2500;
    phaseMillis = 0;
    amplitude = 100;
    position = 0;
    minValue = 0;
    maxValue = 255;
    phasingMillis = 0;

    constructor() {
        super('curve');
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if(fixtureIndex) {
            phasingIndex = fixtureIndex;
        }

        let phase = this.phaseMillis + phasingIndex * this.phasingMillis;

        // Calculate the value according to the curve
        let value = this.amplitude / 2 * Math.sin((2 * Math.PI * (timeMillis - phase) / this.lengthMillis)) + 255 / 2 + this.position;

        if (value < this.minValue) {
            value = this.minValue;
        }

        if (value > this.maxValue) {
            value = this.maxValue;
        }

        return value;
    }

}
