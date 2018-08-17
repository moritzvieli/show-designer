import { EffectMapping } from './effect-mapping';
import { IFixture } from "./i-fixture";

export class Fixture implements IFixture {

    uid: string;
    name: string;
    isSelected: boolean = false;

    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    getEffectMappings(): EffectMapping<any>[] {
        return [];
    }

}
