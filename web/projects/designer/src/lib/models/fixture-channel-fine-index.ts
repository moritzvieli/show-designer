import { FixtureChannel } from "./fixture-channel";

// contains a fixture channela and its fine index, if available
export class FixtureChannelFineIndex {

    // the corresponding channel
    fixtureChannel: FixtureChannel;

    // the total fine value count
    fineValueCount: number = 0;

    // the fine value of the current channel
    fineIndex: number = -1;

    constructor(
        fixtureChannel?: FixtureChannel,
        fineValueCount: number = 0,
        fineIndex: number = -1
    ) {
        this.fixtureChannel = fixtureChannel;
        this.fineValueCount = fineValueCount;
        this.fineIndex = fineIndex;
    }

}
