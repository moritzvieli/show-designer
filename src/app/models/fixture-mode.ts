import { FixtureProperty } from "./fixture-property";
import { UuidService } from "../services/uuid.service";

export class FixtureMode {

    uuid: string;
    channelCount: number;

    // All available fixture properties (= channels)
    fixtureProperties: FixtureProperty[] = [];

    constructor(private uuidService: UuidService) {
        if (this.uuidService) {
            this.uuid = this.uuidService.getUuid();
        }
    }

}
