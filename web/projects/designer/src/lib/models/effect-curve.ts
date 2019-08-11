import { Effect } from './effect';
import { FixtureCapability } from './fixture-capability';
import { EffectCurveTemplateChannels } from './effect-curve-template-channel';

export class EffectCurve extends Effect {

    capabilities: FixtureCapability[] = [];
    channels: EffectCurveTemplateChannels[] = [];

    lengthMillis = 2500;
    phaseMillis = 0;
    amplitude = 100;
    position = 50;
    minValue = 0;
    maxValue = 100;
    phasingMillis = 0;

    constructor(data?: any) {
        super(data);

        if(!data) {
            return;
        }

        if(data.capabilities) {
            for (let capability in data.capabilities) {
                this.capabilities.push(new FixtureCapability(capability));
            }
        }

        if(data.channels) {
            for (let channel in data.channels) {
                this.channels.push(new EffectCurveTemplateChannels(channel));
            }
        }

        this.lengthMillis = data.lengthMillis;
        this.phaseMillis = data.phaseMillis;
        this.amplitude = data.amplitude;
        this.position = data.position;
        this.maxValue = data.maxValue;
        this.phasingMillis = data.phasingMillis;
    }

    // TODO get value percentage?
    public getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if(fixtureIndex) {
            phasingIndex = fixtureIndex;
        }

        let phase = this.phaseMillis + phasingIndex * this.phasingMillis;

        // Calculate the value according to the curve
        let value = this.amplitude / 2 * Math.sin((2 * Math.PI * (timeMillis - phase) / this.lengthMillis)) / 2 + this.position;

        if (value < this.minValue) {
            value = this.minValue;
        }

        if (value > this.maxValue) {
            value = this.maxValue;
        }

        return value;
    }



}
