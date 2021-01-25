import { UuidService } from '../services/uuid.service';

export class FixturePropertyRange {
  uuid: string;
  channelFrom: number;
  channelTo: number;
  name: string;

  // Use a slider to specify this range. If false, the range can only
  // be selected all at once.
  useSlider = false;

  isDefault = false;

  constructor(private uuidService: UuidService) {
    if (this.uuidService) {
      this.uuid = this.uuidService.getUuid();
    }
  }
}
