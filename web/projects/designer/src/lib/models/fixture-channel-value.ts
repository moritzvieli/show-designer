export class FixtureChannelValue {

    channelName: string;
    fixtureTemplateUuid: string;
    value: number;

    constructor(data?: any) {
        if(!data) {
            return;
        }
        this.channelName = data.channelName;
        this.fixtureTemplateUuid = data.fixtureTemplateUuid;
        this.value = data.value;
    }

}
