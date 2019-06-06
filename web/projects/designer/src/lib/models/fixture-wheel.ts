import { FixtureWheelSlot } from "./fixture-wheel-slot";

export class FixtureWheel {

    slots: FixtureWheelSlot[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        if(data.slots) {
            for(let slot of data.slots) {
                this.slots.push(new FixtureWheelSlot(slot));
            }
        }
    }

}