import { Effect } from "src/app/models/effect";
import { Fixture } from "src/app/models/fixture";

export interface IFixture3d {

    // Update the animation of this fixture, respecting its index (e.g. used for phasing-effects)
    update(timeMillis: number, fixtureIndex: number, effects: Effect[], sceneFixture: Fixture): void;

    getUid(): string;

}
