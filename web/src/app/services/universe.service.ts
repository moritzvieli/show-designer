import { Injectable } from '@angular/core';
import { Universe } from '../models/universe';

@Injectable({
  providedIn: 'root'
})
export class UniverseService {

  universes: Universe[] = [];

  constructor() { }
  
  getUniverseByUuid(uuid: string): Universe {
    for (let universe of this.universes) {
      if (universe.uuid = uuid) {
        return universe;
      }
    }
  }

}
