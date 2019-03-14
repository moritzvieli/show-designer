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
        // Apply default settings
        this.colorRed = 0;
        this.colorGreen = 0;
        this.colorBlue = 0;

        for (let propertyValue of propertyValues) {
            switch (propertyValue.fixturePropertyType) {
                case FixturePropertyType.colorGreen: {
                    // Round needed for threejs
                    this.colorGreen = Math.round(propertyValue.value);
                    break;
                }
                case FixturePropertyType.colorRed: {
                    // Round needed for threejs
                    this.colorRed = Math.round(propertyValue.value);
                    break;
                }
                case FixturePropertyType.colorBlue: {
                    // Round needed for threejs
                    this.colorBlue = Math.round(propertyValue.value);
                    break;
                }
            }
        }
    }

}
