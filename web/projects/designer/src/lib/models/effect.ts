export abstract class Effect {

    type: string;
    uuid: string;

    constructor(type: string, data?: any) {
        this.type = type;

        if (!data) {
            return;
        }

        this.uuid = data.uuid;
    }

}
