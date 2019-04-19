import { Injectable } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  waveSurfer: WaveSurfer;
  playState: string = 'paused';

  beatsPerMinute: number = 178;
  timeSignatureUpper: number = 6;
  timeSignatureLower: number = 8;

  snapToGrid: boolean = true;
  // time based or musical
  gridType: string = 'musical';
  // e.g. 1/1, 1/2, 1/4, etc.
  gridResolution: number = 8;
  gridOffsetMillis: number = 50;

  constructor() { }

}
