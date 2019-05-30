import { Effect } from "./effect";
import { FixtureChannelValue } from "./fixture-channel-value";

export class Preset {

    uuid: string;
    name: string;

    // all related fixtures
    fixtureUuids: string[] = [];

    // all channel values
    fixtureChannelValues: FixtureChannelValue[] = [];

    // all related effects
    effects: Effect[] = [];

    // known capabilities
    dimmer: number;

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
