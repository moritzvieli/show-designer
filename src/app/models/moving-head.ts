import { Fixture } from './fixture';
import { UuidService } from '../services/uuid.service';

export class MovingHead extends Fixture {

    colorR: number = 0;
    colorG: number = 0;
    colorB: number = 0;

    pan: number = 127;
    tilt: number = 127;

    maxPanDegrees: number = 540;
    maxTiltDegrees: number = 270;

    beamAngleDegrees: number = 14;

    constructor(uuidService: UuidService) {
        super(uuidService);

        this.name = 'Moving Head';
    }

}
