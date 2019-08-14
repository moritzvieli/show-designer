import { Composition } from "./composition";
import { Fixture } from "./fixture";
import { Scene } from "./scene";
import { Preset } from "./preset";
import { FixtureTemplate } from "./fixture-template";

export class Project {

    public uuid: string;
    public name: string;

    public masterDimmerValue: number = 1;

    public compositions: Composition[] = [];
    public fixtureTemplates: FixtureTemplate[] = [];
    public fixtures: Fixture[] = [];
    public scenes: Scene[] = [];
    public presets: Preset[] = [];

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.masterDimmerValue = data.masterDimmerValue;

        if (data.compositions) {
            for (let composition of data.compositions) {
                this.compositions.push(new Composition(composition));
            }
        }

        if (data.fixtureTemplates) {
            for (let fixtureTemplate of data.fixtureTemplates) {
                this.fixtureTemplates.push(new FixtureTemplate(fixtureTemplate));
            }
        }

        if (data.fixtures) {
            for (let fixture of data.fixtures) {
                // TODO
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
