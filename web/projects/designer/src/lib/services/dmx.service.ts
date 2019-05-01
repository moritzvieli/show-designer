import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DmxService {

  constructor() { }

  roundDmx(value: number): number {
    // Round the provided value to a valid DMX value

    if (value < 0) {
      return 0;
    }

    if (value > 255) {
      return 255;
    }

    return Math.round(value);
  }

  getDmxFineValue1(value: number): number {
    // Return the fine value 1 for a given value
    return 255 * (value - this.roundDmx(value)) / 100;
  }

  getDmxFineValue2(value: number): number {
    // Return the fine value 2 for a given value
    // TODO
    return 0;
  }

  isValidDmxValue(value: any): boolean {
    if(isNaN(value)){
      return false;
    }

    if(value < 0 || value > 255) {
      return false;
    }

    return true;
  }

}
