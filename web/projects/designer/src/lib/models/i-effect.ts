export interface IEffect {
    
    uuid: string;

    // Update the animation of this fixture, respecting its index (e.g. used for phasing-effects)
    getValueAtMillis(timeMillis: number, fixtureIndex: number);

}
