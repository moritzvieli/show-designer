import { FixtureCapability } from "./fixture-capability";

export class FixtureChannel {

    fineChannelAliases: string[] = [];
    defaultValue: string | number;
    capability: FixtureCapability;
    dmxValueResolution: string;

    constructor(data?: any) {
        if(!data) {
            return;
        }

        if(data.fineChannelAliases) {
            this.fineChannelAliases = data.fineChannelAliases;
        }

        this.defaultValue = data.defaultValue;
        this.dmxValueResolution = data.dmxValueResolution;
        this.capability = new FixtureCapability(data.capability);
    }

}
