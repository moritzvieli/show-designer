export interface IFixture3d {

    // Update the animation of this fixture, respecting its index (e.g. used for phasing-effects)
    update(timeMillis: number, fixtureIndex: number);

}
