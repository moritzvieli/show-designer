import { FixturePropertyValue } from "src/app/models/fixture-property-value";
import { FixtureTemplate } from "src/app/models/fixture-template";
import { Fixture } from "src/app/models/fixture";
import { FixturePropertyType } from "src/app/models/fixture-property";

export abstract class Fixture3d {

    fixture: Fixture;
    fixtureTemplate: FixtureTemplate;

    colorRed: number;
    colorGreen: number;
    colorBlue: number;

    constructor(fixture: Fixture, fixtureTemplate: FixtureTemplate) {
        this.fixture = fixture;
        this.fixtureTemplate = fixtureTemplate;
    }

    // Apply the properties of the base fixture to the preview
    updatePreview(propertyValues: FixturePropertyValue[]) {
        this.colorRed = 0;
        this.colorGreen = 0;
        this.colorBlue = 0;

        for (let propetryValue of propertyValues) {
            switch (propetryValue.fixturePropertyType) {
                case FixturePropertyType.colorGreen: {
                    this.colorGreen = propetryValue.value;
                    break;
                }
                case FixturePropertyType.colorRed: {
                    this.colorRed = propetryValue.value;
                    break;
                }
                case FixturePropertyType.colorBlue: {
                    this.colorBlue = propetryValue.value;
                    break;
                }
            }
        }
    }

}
