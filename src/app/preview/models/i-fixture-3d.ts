import { Effect } from "src/app/models/effect";
import { Fixture } from "src/app/models/fixture";

export interface IFixture3d {

    // Update the animation of this fixture, respecting its index (e.g. used for phasing-effects)
    getFixtureStateAtMillis(timeMillis: number, fixture: Fixture, fixtureIndex: number, effects: Effect[], baseProperties: Fixture, fadeProperties: Fixture, fadePercentage: number): Fixture;

    // Apply the properties of the base fixture to the preview
    updatePreview(fixture: Fixture): void;

    getFixture(): Fixture;

}
