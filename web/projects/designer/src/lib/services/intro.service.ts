import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class IntroService {

  showIntro: boolean = false;
  activeStep: string = 'start';

  constructor(
    private configService: ConfigService
  ) {
    if (this.configService.intro) {
      if (localStorage.getItem('showIntro')) {
        this.showIntro = localStorage.getItem('showIntro') == 'true';
      } else {
        this.showIntro = true;
      }
    }
  }

  setShowIntro(value: boolean) {
    this.showIntro = value;
    if (value) {
      localStorage.setItem('showIntro', 'true');
    } else {
      localStorage.setItem('showIntro', 'false');
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
