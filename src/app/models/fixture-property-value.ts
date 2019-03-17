import { FixturePropertyType } from "./fixture-property";

export class FixturePropertyValue {

    fixturePropertyType: FixturePropertyType;

    // DMX value between 0 and 255
    value: number;

    constructor(
        fixturePropertyType?: FixturePropertyType,
        value?: number
    ) {
        this.fixturePropertyType = fixturePropertyType;
        this.value = value;
    }

}
