export class FixtureChannelValue {

    channelName: string;
    fixtureTemplateUuid: string;
    value: number;

    constructor(channelName?: string, fixtureTemplateUuid?: string, value?: number) {
        this.channelName = channelName;
        this.fixtureTemplateUuid = fixtureTemplateUuid;
        this.value = value;
    }

}
