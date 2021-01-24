export class FixtureChannelValue {

    channelName: string;
    profileUuid: string;
    value: number;

    constructor(data?: any) {
        if (!data) {
            return;
        }
        this.channelName = data.channelName;
        this.profileUuid = data.profileUuid;
        this.value = data.value;
    }

}
