export class FixtureModeChannel {
  // direct reference to an available channel
  name: string;

  // a matrix channel
  insert: string;
  repeatFor: string[] = [];
  channelOrder: string;
  templateChannels: string[] = [];

  constructor(data?: any) {
    if (!data) {
      return;
    }

    if (typeof data === 'string') {
      this.name = data;
    } else if (typeof data === 'object') {
      // after first saving the project, we have a FixtureModeChannel-object, even if it's just a direct channel with a name
      this.name = data.name;

      this.insert = data.insert;
      this.repeatFor = data.repeatFor;
      this.channelOrder = data.channelOrder;
      this.templateChannels = data.templateChannels;
    }
  }
}
