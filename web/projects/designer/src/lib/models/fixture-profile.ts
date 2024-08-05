import { FixtureChannel } from './fixture-channel';
import { FixtureMode } from './fixture-mode';
import { FixturePhysical } from './fixture-physical';
import { FixtureWheel } from './fixture-wheel';

export enum FixtureCategory {
  Blinder = 'Blinder',
  'Color Changer' = 'Color Changer',
  Dimmer = 'Dimmer',
  Effect = 'Effect',
  Fan = 'Fan',
  Flower = 'Flower',
  Hazer = 'Hazer',
  Laser = 'Laser',
  Matrix = 'Matrix',
  'Moving Head' = 'Moving Head',
  'Pixel Bar' = 'Pixel Bar',
  Scanner = 'Scanner',
  Smoke = 'Smoke',
  Stand = 'Stand',
  Strobe = 'Strobe',
  Other = 'Other',
  'Barrel Scanner' = 'Barrel Scanner',
}

export class FixtureProfile {
  uuid: string;
  name: string;

  // set to file, if the profile is not loaded from the backend
  source: string;
  createdFromFile = false;
  manufacturerShortName: string;
  manufacturerName: string;
  categories: FixtureCategory[] = [];
  physical: FixturePhysical;
  availableChannels: any = {};
  shortName: string;
  wheels: any = {};

  // All available fixture modes
  modes: FixtureMode[] = [];

  constructor(data?: any) {
    if (!data) {
      return;
    }

    // metadata
    this.uuid = data.uuid;
    this.name = data.name;
    this.manufacturerName = data.manufacturerName;
    this.manufacturerShortName = data.manufacturerShortName;

    if (data.categories) {
      for (const category of data.categories) {
        this.categories.push(FixtureCategory[category as string]);
      }
    } else if (data.mainCategory) {
      this.categories.push(FixtureCategory[data.mainCategory as string]);
    }
    if (data.physical) {
      this.physical = new FixturePhysical(data.physical);
    }
    if (data.wheels) {
      for (const property of Object.keys(data.wheels)) {
        const wheel = new FixtureWheel(data.wheels[property]);
        this.wheels[property] = wheel;
      }
    }
    if (data.modes) {
      for (const mode of data.modes) {
        this.modes.push(new FixtureMode(mode));
      }
    }
    if (data.availableChannels) {
      for (const property of Object.keys(data.availableChannels)) {
        const fixtureChannel = new FixtureChannel(data.availableChannels[property]);
        this.availableChannels[property] = fixtureChannel;
      }
    }
    if (data.createdFromFile) {
      this.createdFromFile = data.createdFromFile;
    }
  }
}
