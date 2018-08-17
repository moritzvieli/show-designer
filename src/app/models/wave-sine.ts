import { EffectService } from './../services/effect.service';
import { FixtureService } from '../services/fixture.service';
import { UuidService } from '../services/uuid.service';
import { Effect } from './effect';
import { IEffect } from './i-effect';
import { IFixture } from './i-fixture';

export class WaveSine extends Effect implements IEffect {

    lengthMillis = 2000;
    phaseMillis = 0;
    amplitude = 255;
    position = 0;
    minValue = undefined;
    maxValue = undefined;
    phasingMillis = 0;

    constructor(uuidService: UuidService,
        private fixtureService: FixtureService,
        private effectService: EffectService) {

        super(uuidService);
    }

    getValueAtMillis(timeMillis: number, fixtureIndex: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        for(var i = 0; i < this.fixtureService.fixtures.length; i++) {
            let fixture: IFixture = this.fixtureService.fixtures[i];

            if (fixtureIndex == i) {
                // The current fixture is the one we need to get the phasing-index
                break;
            }

            if (this.effectService.effectContainedInEffectMappings(this.uuid, fixture.getEffectMappings())) {
                phasingIndex++;
            }
        }

        let phasingOffset = phasingIndex * this.phasingMillis;

        // Calculate the value according to the curve
        let value = this.amplitude / 2 * Math.sin((2 * Math.PI * (timeMillis - this.phaseMillis) / this.lengthMillis) + this.amplitude / 2) + this.amplitude / 2 + this.position - phasingOffset;

        if (this.minValue && value < this.minValue) {
            value = this.minValue;
        }

        if (this.maxValue && value > this.maxValue) {
            value = this.maxValue;
        }

        return value;
    }

}
