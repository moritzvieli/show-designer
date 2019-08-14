import { FixtureChannel } from "./fixture-channel";
import { CachedFixtureCapability } from "./cached-fixture-capability";
import { FixtureWheel } from "./fixture-wheel";

export class CachedFixtureChannel {

    // the corresponding channel
    channel: FixtureChannel;

    // the name of the channel
    name: string;

    // all channel capabilities
    capabilities: CachedFixtureCapability[] = [];

    // default value
    defaultValue: number;

    // maximum value
    maxValue: number;

    // a color wheel, if available
    colorWheel: FixtureWheel;

    getCapabilityInValue(channel: string, value: number): CachedFixtureCapability {
        // get a capability in a specific dmx value range
        for (let capability of this.capabilities) {
            if (capability.capability.dmxRange.length == 0 || (value >= capability.capability.dmxRange[0] && value <= capability.capability.dmxRange[1])) {
                return capability;
            }
        }

        return null;
    }

}
