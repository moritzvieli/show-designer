import { FixtureCapabilityType, FixtureCapabilityColor } from "./fixture-capability";

export class FixtureCapabilityValue {

    type: FixtureCapabilityType;
    color: FixtureCapabilityColor;

    // DMX value between 0 and 255
    value: number;

    constructor(
        type?: FixtureCapabilityType,
        value?: number,
        options?: any
    ) {
        this.type = type;
        this.value = value;

        if (options) {
            this.color = options.color;
        }
    }

}
