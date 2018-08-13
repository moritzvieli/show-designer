import { IEffect } from "./i-effect";

export class EffectMapping<T> {
    
    effect: IEffect;
    channels: T[] = [];

}
