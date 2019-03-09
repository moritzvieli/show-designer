import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  // Fires, when the current preview element has changed
  previewSelectionChanged: Subject<void> = new Subject<void>();

  // True = show the preset, false = show the selected scene
  previewPreset: boolean = true;

  constructor() { }

}
