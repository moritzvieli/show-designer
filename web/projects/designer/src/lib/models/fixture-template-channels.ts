export class FixtureTemplateChannels {

    templateUuid: string;
    channels: any[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.templateUuid = data.templateUuid;

        if(data.channels) {
            this.channels = data.channels;
        }
    }

}
