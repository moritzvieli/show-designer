import { Composition } from "./composition";
import { Fixture } from "./fixture";
import { Scene } from "./scene";
import { Preset } from "./preset";
import { FixtureTemplate } from "./fixture-template";

export class Project {

    public uuid: string;
    public name: string;

    public compositions: Composition[] = [];
    public fixtureTemplates: FixtureTemplate[] = [];
    public fixtures: Fixture[] = [];

    // Make sure we always have at least one scene (don't allow deletion of the last scene)
    public scenes: Scene[] = [];

    presets: Preset[] = [];

    constructor() {
    }

}
