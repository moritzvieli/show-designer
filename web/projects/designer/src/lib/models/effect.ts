export abstract class Effect {

    type: string;
    uuid: string;
    visible = true;

    constructor(type: string, data?: any) {
        this.type = type;

        if (!data) {
            return;
        }

        this.uuid = data.uuid;
        this.visible = data.visible;
    }

}
