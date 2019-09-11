export enum Positioning {
    topFront = 'topFront',
    topBack = 'topBack',
    bottomFront = 'bottomFront',
    bottomBack = 'bottomBack',
    manual = 'manual'
}

export class Fixture {

    uuid: string;
    profileUuid: string;
    name: string;
    dmxUniverseUuid: string;
    dmxFirstChannel: number = 5;
    modeShortName: string;
    positioning: Positioning = Positioning.topFront;

    // Only relevant when positioning = manual
    // in CM
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    // in DEG
    rotationX: number = 0;
    rotationY: number = 0;
    rotationZ: number = 0;

    constructor(data?: any) {
        if(!data) {
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
