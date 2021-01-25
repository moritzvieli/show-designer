import { Injectable } from '@angular/core';
import { Effect } from './../models/effect';

@Injectable({
  providedIn: 'root',
})
export class EffectService {
  // The currently selected effect
  selectedEffect: Effect;

  constructor() {}
}
