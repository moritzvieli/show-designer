import { Composition } from "./composition";
import { Fixture } from "./fixture";
import { Scene } from "./scene";
import { Preset } from "./preset";
import { FixtureProfile } from "./fixture-profile";

export class Project {

    public id: string;
    public uuid: string;
    public name: string;

    public masterDimmerValue: number = 1;

    public compositions: Composition[] = [];
    public fixtureProfiles: FixtureProfile[] = [];
    public fixtures: Fixture[] = [];
    public scenes: Scene[] = [];
    public presets: Preset[] = [];

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.id = data.id;

        this.masterDimmerValue = data.masterDimmerValue;

        if (data.compositions) {
            for (let composition of data.compositions) {
                this.compositions.push(new Composition(composition));
            }
        }

        if (data.fixtureProfiles) {
            for (let fixtureProfile of data.fixtureProfiles) {
                this.fixtureProfiles.push(new FixtureProfile(fixtureProfile));
            }
        }

        if (data.fixtures) {
            for (let fixture of data.fixtures) {
                this.fixtures.push(new Fixture(fixture));
            }
        }

        if (data.scenes) {
            for (let scene of data.scenes) {
                this.scenes.push(new Scene(scene));
            }
        }

        if (data.presets) {
            for (let preset of data.presets) {
                this.presets.push(new Preset(preset));
            }
        }
    }

}
