import { Effect } from './effect';
import { FixtureCapability } from './fixture-capability';
import { EffectCurveProfileChannels } from './effect-curve-profile-channel';

export class EffectCurve extends Effect {

    curveType: string = 'sine';

    capabilities: FixtureCapability[] = [];
    channels: EffectCurveProfileChannels[] = [];

    lengthMillis = 2500;
    phaseMillis = 0;
    amplitude = 1;
    position = 0.5;
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
        this.phasingMillis = data.phasingMillis;
    }

    public getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if (fixtureIndex) {
            phasingIndex = fixtureIndex;
        }

        let phase = this.phaseMillis + phasingIndex * this.phasingMillis;

        // Calculate the value between 0 and 1 according to the curve
        let value: number = 0;

        switch (this.curveType) {
            case 'sine':
                value = this.amplitude / 2 * Math.sin((2 * Math.PI * (timeMillis - phase) / this.lengthMillis)) / 2;
                break;
            case 'square':
                // TODO
                break;
            case 'triangle':
                // TODO
                break;
            case 'sawtooth':
                // TODO
                break;
            case 'reverse-sawtooth':
                // TODO
                break;
        }

        value += this.position;

        return Math.max(Math.min(value, 1), 0);
    }

}
