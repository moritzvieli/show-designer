export abstract class Effect {

    uuid: string;

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.uuid = data.uuid;
    }

}
