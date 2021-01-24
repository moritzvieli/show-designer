import { FixtureProfile } from './fixture-profile';
import { FixtureMode } from './fixture-mode';
import { Fixture } from './fixture';
import { CachedFixtureChannel } from './cached-fixture-channel';

export class CachedFixture {

    fixture: Fixture;
    profile: FixtureProfile;
    mode: FixtureMode;
    channels: CachedFixtureChannel[] = [];

}
