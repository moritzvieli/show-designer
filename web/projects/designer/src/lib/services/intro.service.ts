import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IntroService {

  showIntro: boolean = false;
  activeStep: string = 'start';

  constructor() {
    if (localStorage.getItem('showIntro')) {
      this.showIntro = localStorage.getItem('showIntro') == 'true';
    }
  }

  reset() {
    this.activeStep = 'start';
    this.showIntro = true;
  }

  showStep(step: string): boolean {
    if (!this.showIntro) {
      return false;
    }

    if (this.activeStep != step) {
      return false;
    }

    return true;
  }

}
