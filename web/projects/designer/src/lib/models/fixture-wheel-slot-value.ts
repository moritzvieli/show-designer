export class FixtureWheelValue {

    templateUuid: string;
    wheelName: string;
    slotIndex: number;

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.templateUuid = data.templateUuid;
        this.wheelName = data.wheelName;
        this.slotIndex = data.slotIndex;
    }

}
