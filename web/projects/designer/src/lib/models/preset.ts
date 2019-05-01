import { Effect } from "./effect";
import { Fixture } from "./fixture";
import { FixtureCapabilityValue } from "./fixture-capability-value";

export class Preset {

    uuid: string;
    name: string;

    // all related fixtures
    fixtures: Fixture[] = [];

    // all properties. Also add the fine properties (16-bit values), if calculated.
    // The fixtures will pick up the corresponding values, if available.
    capabilityValues: FixtureCapabilityValue[] = [];

    // all related effects
    effects: Effect[] = [];

    // position offset, relative to the scene start
    // (undefined = start/end of the scene itself)
    startMillis: number;
    endMillis: number;

    // fading times
    fadeInMillis: number = 0;
    fadeOutMillis: number = 0;

    constructor() {
    }

}
