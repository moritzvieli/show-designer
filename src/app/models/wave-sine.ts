import { Effect } from './effect';
import { IEffect } from './i-effect';

export class WaveSine extends Effect implements IEffect {
    
    lengthMillis = 2000;
    phaseMillis = 0;
    amplitude = 255;
    position = 0;
    minValue = undefined;
    maxValue = undefined;

    getValueAtMillis(timeMillis: number): number {
        this.position = this.amplitude / 2;
        let value = this.amplitude / 2 * Math.sin((2 * Math.PI * (timeMillis - this.phaseMillis) / this.lengthMillis) + this.amplitude / 2) + this.position;

        if(this.minValue && value < this.minValue) {
            value = this.minValue;
        }

        if(this.maxValue && value > this.maxValue) {
            value = this.maxValue;
        }

        return value;
    }

}
