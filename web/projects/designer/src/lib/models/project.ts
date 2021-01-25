import { Composition } from './composition';
import { Fixture } from './fixture';
import { FixtureProfile } from './fixture-profile';
import { Preset } from './preset';
import { Scene } from './scene';

export class Project {
  public id: number;
  public uuid: string;
  public name: string;
  public shareToken: string;

  public stageWidthCm = 600;
  public stageHeightCm = 350;
  public stageDepthCm = 600;

  public stageFloorHeightCm = 30;
  public stageCeilingHeightCm = 5;
  public stagePillarWidthCm = 20;

  public masterDimmerValue = 1;

  public selectedPresetUuid: string;
  public selectedSceneUuids: string[] = [];

  // true = show the preset, false = show the selected scene
  public previewPreset = true;

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
      for (const composition of data.compositions) {
        this.compositions.push(new Composition(composition));
      }
    }

    if (data.fixtureProfiles) {
      for (const fixtureProfile of data.fixtureProfiles) {
        this.fixtureProfiles.push(new FixtureProfile(fixtureProfile));
      }
    }

    if (data.fixtures) {
      for (const fixture of data.fixtures) {
        this.fixtures.push(new Fixture(fixture));
      }
    }

    if (data.scenes) {
      for (const scene of data.scenes) {
        this.scenes.push(new Scene(scene));
      }
    }

    if (data.presets) {
      for (const preset of data.presets) {
        this.presets.push(new Preset(preset));
      }
    }
  }
}
