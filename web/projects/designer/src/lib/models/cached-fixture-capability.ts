import { FixtureCapability } from './fixture-capability';
import { FixtureWheel } from './fixture-wheel';
import { FixtureWheelSlot } from './fixture-wheel-slot';

export class CachedFixtureCapability {
  capability: FixtureCapability;

  // the wheel names, if available
  wheelName: string;

  // the wheel, if available
  wheel: FixtureWheel;

  // the wheel slots, if available
  wheelSlots: FixtureWheelSlot[] = [];

  // is this a color wheel?
  wheelIsColor = false;

  centerValue: number;
}
