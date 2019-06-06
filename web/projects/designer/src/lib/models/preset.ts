import { Effect } from "./effect";
import { FixtureChannelValue } from "./fixture-channel-value";
import { FixtureCapabilityValue } from "./fixture-capability-value";
import { FixtureWheelValue } from "./fixture-wheel-slot-value";

export class Preset {

    uuid: string;
    name: string;

    // all related fixtures
    fixtureUuids: string[] = [];

    // the selected values
    fixtureChannelValues: FixtureChannelValue[] = [];
    fixtureCapabilityValues: FixtureCapabilityValue[] = [];
    fixtureWheelValues: FixtureWheelValue[] = [];

    // all related effects
    effects: Effect[] = [];

    // position offset, relative to the scene start
    // (undefined = start/end of the scene itself)
    startMillis: number;
    endMillis: number;

    // fading times
    fadeInMillis: number = 0;
    fadeOutMillis: number = 0;

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.uuid = data.uuid;
        this.name = data.name;
        this.fixtureUuids = data.fixtureUuids;
        if (data.fixtureChannelValues) {
            for (let fixtureChannelValue of data.fixtureChannelValues) {
                this.fixtureChannelValues.push(new FixtureChannelValue(fixtureChannelValue));
            }
        }
        if (data.fixtureCapabilityValues) {
            for (let fixtureCapabilityValue of data.fixtureCapabilityValues) {
                this.fixtureCapabilityValues.push(new FixtureCapabilityValue(fixtureCapabilityValue));
            }
        }
        if (data.fixtureWheelValues) {
            for (let wheelValue of data.fixtureWheelValues) {
                this.fixtureWheelValues.push(new FixtureWheelValue(wheelValue));
            }
        }
        if (data.effects) {
            for (let effect of data.effects) {
                // TODO
                // this.effects.push(new Effect(effect));
            }
        }
        this.startMillis = data.startMillis;
        this.endMillis = data.endMillis;
        this.fadeInMillis = data.fadeInMillis;
        this.fadeOutMillis = data.fadeOutMillis;
    }

}
