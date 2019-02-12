import { Injectable } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  waveSurfer: WaveSurfer;
  playState: string = 'paused';

  constructor() { }
}
