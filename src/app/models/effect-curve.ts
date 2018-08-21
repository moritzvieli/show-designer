import { Fixture } from './fixture';
import { EffectService } from '../services/effect.service';
import { FixtureService } from '../services/fixture.service';
import { UuidService } from '../services/uuid.service';
import { Effect } from './effect';

export class EffectCurve extends Effect {

    lengthMillis = 2500;
    phaseMillis = 0;
    amplitude = 255;
    position = 0;
    minValue = 0;
    maxValue = 255;
    phasingMillis = 0;

    constructor(uuidService: UuidService,
        private fixtureService: FixtureService,
        private effectService: EffectService) {

        super(uuidService);
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if(fixtureIndex) {
            for(var i = 0; i < this.fixtureService.fixtures.length; i++) {
                let fixture: Fixture = this.fixtureService.fixtures[i];

                if (fixtureIndex == i) {
                    // The current fixture is the one we need to get the phasing-index
                    break;
                }

                for(var j = 0; j < fixture.effects.length; j++) {
                    if(fixture.effects[j].uuid == this.uuid) {
                        phasingIndex++;
                        break;
                    }
                }
            }
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
