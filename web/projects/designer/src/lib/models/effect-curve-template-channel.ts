export class EffectCurveTemplateChannels {

    templateUuid: string;
    channels: string[] = [];

    constructor(data?: any) {
        if (!data) {
            return;
        }

        this.templateUuid = data.templateUuid;

        if (data.channels) {
            for (let channel in data.channels) {
                this.channels.push(channel);
            }
        }
    }

}
