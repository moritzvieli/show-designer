import { Effect } from './effect';
export enum Positioning
{
    topFront,
    topBack,
    bottomFront,
    bottomBack,
    manual
}

export class Fixture {

    uid: string;
    effects: Effect[] = [];
    name: string;
    isSelected: boolean = false;

    // Only relevant when positioning = manual
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    positioning: Positioning = Positioning.topFront;

}
