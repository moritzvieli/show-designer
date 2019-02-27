import { Injectable } from '@angular/core';
import { Preset } from '../models/preset';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  presets: Preset[] = [];

  constructor() { }

}
