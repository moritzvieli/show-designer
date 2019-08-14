export class EffectCurveProfileChannels {

    profileUuid: string;
    channels: string[] = [];

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.profileUuid = data.profileUuid;

        if (data.channels) {
            for (let channel in data.channels) {
                this.channels.push(channel);
            }
        }
    }

}
