import { FixtureTemplate } from "./fixture-template";
import { FixtureMode } from "./fixture-mode";
import { Fixture } from "./fixture";
import { CachedFixtureChannel } from "./cached-fixture-channel";

export class CachedFixture {

    fixture: Fixture;
    template: FixtureTemplate;
    mode: FixtureMode;
    channels: CachedFixtureChannel[] = [];

}
