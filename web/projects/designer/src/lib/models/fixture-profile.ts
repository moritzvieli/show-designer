import { FixtureMode } from './fixture-mode';
import { FixtureChannel } from './fixture-channel';
import { FixtureWheel } from './fixture-wheel';

export enum FixtureCategory {
    Blinder = "Blinder",
    'Color Changer' = "Color Changer",
    Dimmer = "Dimmer",
    Effect = "Effect",
    Fan = "Fan",
    Flower = "Flower",
    Hazer = "Hazer",
    Laser = "Laser",
    Matrix = "Matrix",
    'Moving Head' = "Moving Head",
    'Pixel Bar' = "Pixel Bar",
    Scanner = "Scanner",
    Smoke = "Smoke",
    Stand = "Stand",
    Strobe = "Strobe",
    Other = "Other"
}

export class FixtureProfile {

    uuid: string;
    name: string;
    manufacturerShortName: string;
    manufacturerName: string;
    categories: FixtureCategory[] = [];
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

        if(data.categories) {
            for(let category of data.categories) {
                this.categories.push(FixtureCategory[<string>category]);
            }
        }
        if(data.wheels) {
            for (let property in data.wheels) {
                let wheel = new FixtureWheel(data.wheels[property]);
                this.wheels[property] = wheel;
            }
        }
        if (data.modes) {
            for (let mode of data.modes) {
                this.modes.push(new FixtureMode(mode));
            }
        }
        if (data.availableChannels) {
            for (let property in data.availableChannels) {
                let fixtureChannel = new FixtureChannel(data.availableChannels[property]);
                this.availableChannels[property] = fixtureChannel;
            }
        }
    }

}
