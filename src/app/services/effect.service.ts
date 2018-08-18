import { Effect } from './../models/effect';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EffectService {

  effects: Effect[] = [];

  constructor() { }

}
