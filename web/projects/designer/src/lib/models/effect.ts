export abstract class Effect {

    type: string;
    uuid: string;
    visible: boolean = true;

    constructor(type: string, data?: any) {
        this.type = type;

        if (!data) {
            return;
        }

        this.uuid = data.uuid;
    }

}
