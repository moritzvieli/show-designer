import { FixtureCapabilityType, FixtureCapabilityColor } from "./fixture-capability";

export class FixtureCapabilityValue {

    // value between 0 and 1
    valuePercentage: number;
    type: FixtureCapabilityType;
    color: FixtureCapabilityColor;

    constructor(data?: any) {
        if(!data) {
            return;
        }
        this.valuePercentage = data.valuePercentage;
        this.type = FixtureCapabilityType[<string>data.type];
        this.color = FixtureCapabilityColor[<string>data.color];
    }

}
