import { FixtureCapability } from "./fixture-capability";

export class FixtureChannel {

    defaultValue: string;
    capability: FixtureCapability;
    dmxValueResolution: string;

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.defaultValue = data.defaultValue;
        this.dmxValueResolution = data.dmxValueResolution;
        this.capability = new FixtureCapability(data.capability);
    }

}
