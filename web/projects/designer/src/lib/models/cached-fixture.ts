import { CachedFixtureChannel } from './cached-fixture-channel';
import { Fixture } from './fixture';
import { FixtureMode } from './fixture-mode';
import { FixtureProfile } from './fixture-profile';

export class CachedFixture {
  fixture: Fixture;
  pixelKey: string;
  profile: FixtureProfile;
  mode: FixtureMode;
  channels: CachedFixtureChannel[] = [];
}
