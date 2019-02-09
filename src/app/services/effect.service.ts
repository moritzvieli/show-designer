import { Effect } from './../models/effect';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  // The currently selected effect
  selectedEffect: Effect;

  constructor() { }

}
