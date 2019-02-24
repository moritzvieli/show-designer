import { Fixture } from './fixture';
import { UuidService } from '../services/uuid.service';

export class MovingHead extends Fixture {

    // Properties
    colorR: number = undefined;
    colorG: number = undefined;
    colorB: number = undefined;

    pan: number = undefined;
    tilt: number = undefined;

    // Settings
    maxPanDegrees: number = 540;
    maxTiltDegrees: number = 270;

    beamAngleDegrees: number = 14;

    constructor(uuidService: UuidService) {
        super(uuidService);

        this.name = 'Moving Head';
    }

}
