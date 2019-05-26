export enum FixtureWheelSlowType {
    Open = "Open",
    Closed = "Closed",
    Color = "Color",
    Gobo = "Gobo",
    Prism = "Prism",
    Iris = "Iris",
    Frost = "Frost",
    AnimationGoboStart = "AnimationGoboStart",
    AnimationGoboEnd = "AnimationGoboEnd",
}

export class FixtureWheelSlot {

    type: FixtureWheelSlowType;
    name: string;
    colors: string[] = [];

    constructor(data?: any) {
        if(!data) {
            return;
        }

        this.type = FixtureWheelSlowType[<string>data.type];
        this.name = data.name;
        if(data.colors) {
            this.colors = data.colors;
        }
    }

}
