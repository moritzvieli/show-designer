import { EffectMapping } from './effect-mapping';
import { IFixture } from "./i-fixture";

export enum Positioning
{
    topFront,
    topBack,
    bottomFront,
    bottomBack,
    manual
}

export class Fixture implements IFixture {

    uid: string;
    name: string;
    isSelected: boolean = false;

    // Only relevant when positioning = manual
    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    positioning: Positioning = Positioning.topFront;

    getEffectMappings(): EffectMapping<any>[] {
        return [];
    }

}
