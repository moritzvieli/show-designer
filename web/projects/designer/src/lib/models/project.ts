import { Composition } from "./composition";
import { Fixture } from "./fixture";
import { Scene } from "./scene";
import { Preset } from "./preset";
import { FixtureProfile } from "./fixture-profile";

export class Project {

    public id: number;
    public uuid: string;
    public name: string;
    public shareToken: string;

    public stageWidthCm: number = 600;
    public stageHeightCm: number = 350;
    public stageDepthCm: number = 600;

    public stageFloorHeightCm: number = 30;
    public stageCeilingHeightCm: number = 5;
    public stagePillarWidthCm: number = 20;

    public masterDimmerValue: number = 1;

    public selectedPresetUuid: string;
    public selectedSceneUuids: string[] = [];

    // true = show the preset, false = show the selected scene
    public previewPreset: boolean = true;

    public selectedCompositionUuid: string;

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
        this.uuid = data.uuid;
        this.name = data.name;
        this.shareToken = data.shareToken;

        this.stageWidthCm = data.stageWidthCm;
        this.stageHeightCm = data.stageHeightCm;
        this.stageDepthCm = data.stageDepthCm;

        this.stageFloorHeightCm = data.stageFloorHeightCm;
        this.stageCeilingHeightCm = data.stageCeilingHeightCm;
        this.stagePillarWidthCm = data.stagePillarWidthCm;

        this.masterDimmerValue = data.masterDimmerValue;

        this.selectedPresetUuid = data.selectedPresetUuid;
        this.selectedSceneUuids = data.selectedSceneUuids;
        this.previewPreset = data.previewPreset;
        this.selectedCompositionUuid = data.selectedCompositionUuid;

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
