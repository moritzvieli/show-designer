import { CachedFixtureCapability } from './cached-fixture-capability';
import { FixtureChannel } from './fixture-channel';
import { FixtureWheel } from './fixture-wheel';

export class CachedFixtureChannel {
  // the corresponding channel
  channel: FixtureChannel;

  // the name of the channel
  name: string;

  // all channel capabilities
  capabilities: CachedFixtureCapability[] = [];

  // default value
  defaultValue: number;

  // maximum value
  maxValue: number;

  // a color wheel, if available
  colorWheel: FixtureWheel;
}
