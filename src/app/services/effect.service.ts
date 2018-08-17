import { EffectMapping } from './../models/effect-mapping';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  constructor() { }

  effectContainedInEffectMappings(effectUuid: string, effectMappings: EffectMapping<any>[]): boolean {
    for (let effectMapping of effectMappings) {
      if (effectMapping.effect.uuid == effectUuid) {
        return true;
      }
    }

    return false;
  }

}
