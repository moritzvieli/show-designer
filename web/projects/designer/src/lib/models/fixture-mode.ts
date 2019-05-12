export class FixtureMode {

    name: string;
    shortName: string;
    channels: any[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.name = data.name;
        this.shortName = data.shortName;

        if(data.channels) {
            this.channels = data.channels;
        }
    }

}
