import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public restUrl: string;
  public enableMediaLibrary: boolean = false;
  public loginAvailable: boolean = false;
  public shareAvailable: boolean = false;
  public menuHeightPx: number = 0;
  public languageSwitch: boolean = false;
  public newProjectTemplate: boolean = false;
  public livePreview: boolean = false;
  public localProfiles: boolean = false;
  public intro: boolean = false;
  public uniqueProjectNames: boolean = false;

  public menuHeightChanged: Subject<void> = new Subject<void>();

  constructor() { }

}
