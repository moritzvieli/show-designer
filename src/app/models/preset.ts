import { Effect } from "./effect";
import { Fixture } from "./fixture";
import { FixturePropertyValue } from "./fixture-property-value";
import { UuidService } from "../services/uuid.service";

export class Preset {

    uuid: string;
    name: string;

    // All related fixtures
    fixtures: Fixture[] = [];

    // All properties. Also add the fine properties (16-bit values), if calculated.
    // The fixtures will pick up the corresponding values, if available.
    fixturePropertyValues: FixturePropertyValue[] = [];

    // All related effects
    effects: Effect[] = [];

    // Fading times
    fadeInMillis: number = 0;
    fadeOutMillis: number = 0;

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
