import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HotkeyTargetExcludeService {

  constructor() { }

  exclude(event: any): boolean {
    // don't react on certain targets (e.g. the user is inside an input field)
    if (!event.target) {
      return false;
    }

    if (event.target.nodeName === 'INPUT') {
      return true;
    }

    return false;
  }

}
