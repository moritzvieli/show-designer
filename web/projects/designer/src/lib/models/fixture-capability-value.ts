import { FixtureCapabilityColor, FixtureCapabilityType } from './fixture-capability';

export class FixtureCapabilityValue {
  type: FixtureCapabilityType;
  profileUuid: string;

  // value between 0 and 1
  valuePercentage: number;

  color: FixtureCapabilityColor;
  wheel: string;
  slotNumber: number;

  constructor(data?: any) {
    if (!data) {
      return;
    }
    this.type = FixtureCapabilityType[data.type as string];
    this.profileUuid = data.profileUuid;

    this.valuePercentage = data.valuePercentage;
    this.color = FixtureCapabilityColor[data.color as string];
    this.wheel = data.wheel;
    this.slotNumber = data.slotNumber;
  }
}
