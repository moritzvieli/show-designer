import { FixtureCapabilityType, FixtureCapabilityColor } from "./fixture-capability";

export class FixtureCapabilityValue {

    // DMX value between 0 and 255
    value: number;

    type: FixtureCapabilityType;
    color: FixtureCapabilityColor;

    constructor(
        value?: number,
        type?: FixtureCapabilityType,
        color?: FixtureCapabilityColor
    ) {
        this.value = value;

        this.type = type;
        this.color = color;
    }

}
