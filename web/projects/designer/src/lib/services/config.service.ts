import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  public restUrl: string;
  public enableMediaLibrary: boolean = false;

  constructor() { }
}