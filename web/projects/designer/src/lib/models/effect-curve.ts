import { Effect } from './effect';
import { FixtureCapability } from './fixture-capability';
import { EffectCurveProfileChannels } from './effect-curve-profile-channel';

export class EffectCurve extends Effect {

    type: string = 'sine';

    capabilities: FixtureCapability[] = [];
    channels: EffectCurveProfileChannels[] = [];

    lengthMillis = 2500;
    phaseMillis = 0;
    amplitude = 100;
    position = 50;
    minValue = 0;
    maxValue = 100;
    phasingMillis = 0;

    constructor(data?: any) {
        super('curve', data);

        if (!data) {
            return;
        }

        if (data.capabilities) {
            for (let capability of data.capabilities) {
                this.capabilities.push(new FixtureCapability(capability));
            }
        }

        if (data.channels) {
            for (let channel of data.channels) {
                this.channels.push(new EffectCurveProfileChannels(channel));
            }
        }

        this.lengthMillis = data.lengthMillis;
        this.phaseMillis = data.phaseMillis;
        this.amplitude = data.amplitude;
        this.position = data.position;
        this.maxValue = data.maxValue;
        this.phasingMillis = data.phasingMillis;
    }

    public getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if (fixtureIndex) {
            phasingIndex = fixtureIndex;
        }

        let phase = this.phaseMillis + phasingIndex * this.phasingMillis;

        // Calculate the value according to the curve
        let value: number = 0;

        // Calculate a value between 0 and 100
        switch (this.type) {
            case 'sine':
                value = this.amplitude / 2 * Math.sin((2 * Math.PI * (timeMillis - phase) / this.lengthMillis)) / 2;
                break;
            case 'square':
                value = Math.sign(Math.sin(2 * Math.PI * 100 * timeMillis));
                console.log(value);
                break;
            case 'triangle':

                break;
            case 'sawtooth':

                break;
            case 'reverse-sawtooth':

                break;
        }

        value += this.position;

        if (value < this.minValue) {
            value = this.minValue;
        }

        if (value > this.maxValue) {
            value = this.maxValue;
        }
        console.log(value);
        return value;
    }



}
