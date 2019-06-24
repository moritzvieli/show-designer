import { FixtureCapabilityType, FixtureCapabilityColor } from "./fixture-capability";

export class FixtureCapabilityValue {

    type: FixtureCapabilityType;
    fixtureTemplateUuid: string;

    // value between 0 and 1
    valuePercentage: number;
    color: FixtureCapabilityColor;
    wheel: string;
    slotNumber: number;

    constructor(data?: any) {
        if(!data) {
            return;
        }
        this.type = FixtureCapabilityType[<string>data.type];
        this.fixtureTemplateUuid = data.fixtureTemplateUuid;

        this.valuePercentage = data.valuePercentage;
        this.color = FixtureCapabilityColor[<string>data.color];
        this.wheel = data.wheel;
        this.slotNumber = data.slotNumber;
    }

}
