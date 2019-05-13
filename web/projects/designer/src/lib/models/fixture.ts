import { FixtureTemplate } from './fixture-template';

export enum Positioning {
    topFront,
    topBack,
    bottomFront,
    bottomBack,
    manual
}

export class Fixture {

    uuid: string;
    fixtureTemplateUuid: string;
    name: string;
    dmxUniverseUuid: string;
    dmxFirstChannel: number = 5;
    modeShortName: string;
    positioning: Positioning = Positioning.topFront;

    // Only relevant when positioning = manual
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    constructor(template: FixtureTemplate) {
        this.fixtureTemplateUuid = template.uuid;
        this.name = template.name;

        if(template.modes && template.modes.length > 0) {
            this.modeShortName = template.modes[0].shortName;
        }
    }

}
