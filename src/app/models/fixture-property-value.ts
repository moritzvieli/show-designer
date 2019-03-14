import { FixturePropertyType } from "./fixture-property";

export class FixturePropertyValue {

    fixturePropertyType: FixturePropertyType;
    value: number;

    constructor(
        fixturePropertyType?: FixturePropertyType,
        value?: number
    ) {
        this.fixturePropertyType = fixturePropertyType;
        this.value = value;
    }

}
