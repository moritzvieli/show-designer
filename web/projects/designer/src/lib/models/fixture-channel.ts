import { FixtureCapability } from './fixture-capability';

export class FixtureChannel {
  fineChannelAliases: string[] = [];
  defaultValue: string | number;
  capability: FixtureCapability;
  capabilities: FixtureCapability[] = [];
  dmxValueResolution: string;

  constructor(data?: any) {
    if (!data) {
      return;
    }

    if (data.fineChannelAliases) {
      this.fineChannelAliases = data.fineChannelAliases;
    }

    this.defaultValue = data.defaultValue;
    this.dmxValueResolution = data.dmxValueResolution;

    if (data.capability) {
      this.capability = new FixtureCapability(data.capability);
    } else if (data.capabilities) {
      for (const capability of data.capabilities) {
        this.capabilities.push(new FixtureCapability(capability));
      }
    }
  }
}
