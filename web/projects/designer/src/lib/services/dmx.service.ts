import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DmxService {
  constructor() {}

  isValidDmxValue(value: any): boolean {
    if (isNaN(value)) {
      return false;
    }

    if (value < 0 || value > 255) {
      return false;
    }

    return true;
  }
}
