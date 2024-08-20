export class PresetFixture {
  public fixtureUuid: string;
  public pixelKey: string;

  constructor(data?: any) {
    if (!data) {
      return;
    }

    this.fixtureUuid = data.fixtureUuid;
    this.pixelKey = data.pixelKey;
  }
}
