import { UuidService } from '../services/uuid.service';
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
    type: FixtureType;
    manufacturer: string;
    name: string;
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
    fixtureModes: FixtureMode[] = [];

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
