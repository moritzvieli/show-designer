import { FixtureCapabilityType, FixtureCapabilityColor } from "./fixture-capability";

export class FixtureCapabilityValue {

    // value between 0 and 1
    valuePercentage: number;
    type: FixtureCapabilityType;
    color: FixtureCapabilityColor;
    slotNumber: number;
    wheel: string;
    fixtureTemplateUuid: string;

    constructor(data?: any) {
        if(!data) {
            return;
        }
        this.valuePercentage = data.valuePercentage;
        this.type = FixtureCapabilityType[<string>data.type];
        this.color = FixtureCapabilityColor[<string>data.color];
        this.slotNumber = data.slotNumber;
        this.wheel = data.wheel;
        this.fixtureTemplateUuid = data.fixtureTemplateUuid;
    }

}
