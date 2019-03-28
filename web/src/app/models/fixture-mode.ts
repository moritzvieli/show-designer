import { FixtureProperty } from "./fixture-property";

export class FixtureMode {

    name: string;
    channelCount: number;

    // All available fixture properties (= channels)
    fixtureProperties: FixtureProperty[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.name = data.name;
    }

}
