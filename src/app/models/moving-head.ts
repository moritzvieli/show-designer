import { Fixture } from './fixture';
import { UuidService } from '../services/uuid.service';

export class MovingHead extends Fixture {

    colorR: number = 255;
    colorG: number = 255;
    colorB: number = 255;

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
