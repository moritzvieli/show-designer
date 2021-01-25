export enum Positioning {
  topFront = 'topFront',
  topBack = 'topBack',
  bottomFront = 'bottomFront',
  bottomBack = 'bottomBack',
  manual = 'manual',
}

export class Fixture {
  uuid: string;
  profileUuid: string;
  name: string;
  dmxUniverseUuid: string;
  dmxFirstChannel = 5;
  modeShortName: string;
  positioning: Positioning = Positioning.topFront;

  // Only relevant when positioning = manual
  // in CM
  positionX = 0;
  positionY = 0;
  positionZ = 0;

  // in DEG
  rotationX = 0;
  rotationY = 0;
  rotationZ = 0;

  constructor(data?: any) {
    if (!data) {
      return;
    }

    this.uuid = data.uuid;
    this.profileUuid = data.profileUuid;
    this.name = data.name;
    this.dmxUniverseUuid = data.dmxUniverseUuid;
    this.dmxFirstChannel = data.dmxFirstChannel;
    this.modeShortName = data.modeShortName;
    this.positioning = data.positioning;
    this.positionX = data.positionX;
    this.positionY = data.positionY;
    this.positionZ = data.positionZ;
    this.rotationX = data.rotationX;
    this.rotationY = data.rotationY;
    this.rotationZ = data.rotationZ;
  }
}
