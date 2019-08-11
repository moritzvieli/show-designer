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

    // Make sure we always have at least one scene (don't allow deletion of the last scene)
    public scenes: Scene[] = [];

    public presets: Preset[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.masterDimmerValue = data.masterDimmerValue;

        if(data.compositions) {
            for(let composition of data.compositions) {
                this.compositions.push(new Composition(composition));
            }
        }

        // TODO
        // if(data.fixtureTemplates) {
        //     for(let fixtureTemplates of data.fixtureTemplates) {
        //         this.compositions.push(new FixtureTemplate(fixtureTemplates));
        //     }
        // }

        // TODO
    }

}
