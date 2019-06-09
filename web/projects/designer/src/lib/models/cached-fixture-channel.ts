import { FixtureChannel } from "./fixture-channel";
import { FixtureCapability } from "./fixture-capability";
import { CachedFixtureCapability } from "./cached-fixture-capability";
import { FixtureWheel } from "./fixture-wheel";

export class CachedFixtureChannel {

    // the corresponding channel
    fixtureChannel: FixtureChannel;

    // the name of the channel
    channelName: string;

    // the total fine value count
    fineValueCount: number = 0;

    // the fine value of the current channel
    fineIndex: number = -1;

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
