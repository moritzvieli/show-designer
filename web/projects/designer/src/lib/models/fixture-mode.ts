import { FixtureChannel } from './fixture-channel';

export class FixtureMode {
  name: string;
  shortName: string;
  channels: FixtureChannel[] = [];

  constructor(data?: any) {
    if (!data) {
      return;
    }

    this.name = data.name;
    this.shortName = data.shortName;

    if (data.channels) {
      for (const channel of data.channels) {
        this.channels.push(new FixtureChannel(channel));
      }
    }
  }
}
