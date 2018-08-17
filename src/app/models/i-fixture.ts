import { EffectMapping } from './effect-mapping';

export interface IFixture {
    
    getEffectMappings(): EffectMapping<any>[];

}
