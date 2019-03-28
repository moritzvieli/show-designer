import { FixtureMode } from './fixture-mode';

export enum FixtureType {
    par,
    movingHead,
    scanner,
    blinder,
    laser,
    ledStripMatrix,
    ledBar,
    strobe,
    fogMachine,
    custom
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
    categories: string[];

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

        if(!data) {
        	return;
        }

        this.categories = data.categories || [];

        if(data.modes) {
            for(let mode of data.modes) {
                this.modes.push(new FixtureMode(mode));
            }
        }
    }

}
