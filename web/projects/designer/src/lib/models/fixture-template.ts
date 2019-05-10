import { FixtureMode } from './fixture-mode';
import { FixtureChannel } from './fixture-channel';

export enum FixtureType {
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

export enum BeamType {
    spot,
    wash
}

export enum BeamPositionType {
    single,
    grid,
    rings,
    hexagons,
    custom
}

export class FixtureTemplate {

    uuid: string;
    name: string;
    manufacturerShortName: string;
    manufacturerName: string;
    categories: FixtureType[] = [];
    availableChannels: any = {};

    shortName: string;
    beamType: BeamType = BeamType.spot;
    beamAngleDegrees: number = 14;
    beamPositionType: BeamPositionType = BeamPositionType.single;
    beamPositionGridCells: boolean[][];
    beamRing1Count: number;
    beamRing2Count: number;
    beamRing3Count: number;
    beamRing4Count: number;
    panRangeDegrees: number = 540;
    tiltRangeDegrees: number = 270;
    tiltOffsetDegrees: number = 0;

    // All available fixture modes
    modes: FixtureMode[] = [];

    constructor(metaData: any, data?: any) {
        this.uuid = metaData.uuid;
        this.name = metaData.name;
        this.manufacturerName = metaData.manufacturerName;
        this.manufacturerShortName = metaData.manufacturerShortName;

        if (!data) {
            return;
        }

        if(data.categories) {
            for(let category of data.categories) {
                this.categories.push(FixtureType[<string>category]);
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

        console.log(this);
    }

}
