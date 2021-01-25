import { Fixture } from './fixture';

// The initial properties of a fixture in a scene
export class SceneFixtureProperties {
  // Temporarily deactivate these properties (e.g. by deselecting the fixture)
  active = true;

  // The fixture holding the properties
  properties: Fixture;

  // The fixture which should have the properties set as a base on the scene
  fixture: Fixture;
}
