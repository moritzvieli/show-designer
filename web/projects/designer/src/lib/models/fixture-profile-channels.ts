export class FixtureProfileChannels {

    profileUuid: string;
    channels: any[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.profileUuid = data.profileUuid;

        if(data.channels) {
            this.channels = data.channels;
        }
    }

}
