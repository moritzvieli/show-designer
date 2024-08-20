import { Effect } from './effect';
import { EffectCurve } from './effect-curve';
import { EffectPanTilt } from './effect-pan-tilt';
import { FixtureCapabilityValue } from './fixture-capability-value';
import { FixtureChannelValue } from './fixture-channel-value';
import { PresetFixture } from './preset-fixture';

export class Preset {
  uuid: string;
  name: string;

  // all related fixtures
  // OBSOLETE: replaced with fixtures
  fixtureUuids: string[] = [];
  fixtures: PresetFixture[] = [];

  // the selected values
  fixtureChannelValues: FixtureChannelValue[] = [];
  fixtureCapabilityValues: FixtureCapabilityValue[] = [];

  // all related effects
  effects: Effect[] = [];

  // position offset, relative to the scene start
  // (undefined = start/end of the scene itself)
  startMillis: number;
  endMillis: number;

  // fading times
  fadeInMillis = 0;
  fadeOutMillis = 0;

  // fade in/out outside the start/end times?
  fadeInPre = false;
  fadeOutPost = false;

  constructor(data?: any) {
    if (!data) {
      return;
    }

    this.uuid = data.uuid;
    this.name = data.name;

    // OBSOLETE
    this.fixtureUuids = data.fixtureUuids;

    if (data.fixtures) {
      for (const fixture of data.fixtures) {
        this.fixtures.push(new PresetFixture(fixture));
      }
    }

    if (data.fixtureChannelValues) {
      for (const fixtureChannelValue of data.fixtureChannelValues) {
        this.fixtureChannelValues.push(new FixtureChannelValue(fixtureChannelValue));
      }
    }
    if (data.fixtureCapabilityValues) {
      for (const fixtureCapabilityValue of data.fixtureCapabilityValues) {
        this.fixtureCapabilityValues.push(new FixtureCapabilityValue(fixtureCapabilityValue));
      }
    }
    if (data.effects) {
      for (const effect of data.effects) {
        switch (effect.type) {
          case 'curve':
            this.effects.push(new EffectCurve(effect));
            break;
          case 'pan-tilt':
            this.effects.push(new EffectPanTilt(effect));
            break;
        }
      }
    }
    this.startMillis = data.startMillis;
    this.endMillis = data.endMillis;
    this.fadeInMillis = data.fadeInMillis;
    this.fadeOutMillis = data.fadeOutMillis;
    this.fadeInPre = data.fadeInPre;
    this.fadeOutPost = data.fadeOutPost;
  }
}
