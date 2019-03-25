import { Fixture } from './fixture';
import { FixtureService } from '../services/fixture.service';
import { UuidService } from '../services/uuid.service';
import { Effect } from './effect';

export class EffectPanTilt extends Effect {

    phasingMillis = 0;

    constructor(uuidService: UuidService,
        private fixtureService: FixtureService) {

        super(uuidService);
    }

    getValueAtMillis(timeMillis: number, fixtureIndex?: number): number {
        // Calculate the offset for phasing
        let phasingIndex = 0;

        if(fixtureIndex) {
            phasingIndex = fixtureIndex;
        }

        // let phase = this.phaseMillis + phasingIndex * this.phasingMillis;

        // Calculate the value according to the curve
        // TODO

        return 0;
    }

}
