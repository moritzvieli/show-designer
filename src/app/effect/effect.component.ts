import { Component, OnInit } from '@angular/core';
import { EffectCurve } from '../models/effect-curve';
import { UuidService } from '../services/uuid.service';
import { EffectService } from '../services/effect.service';
import { EffectPanTilt } from '../models/effect-pan-tilt';
import { FixtureService } from '../services/fixture.service';
import { Effect } from '../models/effect';
import { PresetService } from '../services/preset.service';

@Component({
  selector: 'app-effect',
  templateUrl: './effect.component.html',
  styleUrls: ['./effect.component.css']
})
export class EffectComponent implements OnInit {

  constructor(
    private uuidService: UuidService,
    private presetService: PresetService,
    public effectService: EffectService,
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
    this.addPanTiltEffect();
  }

  private addEffect(effect: Effect) {
    this.effectService.selectedEffect = effect;

    if(this.presetService.selectedPreset) {
      this.presetService.selectedPreset.effects.push(effect);
    }
  }

  addCurveEffect() {
    this.addEffect(new EffectCurve(this.uuidService, this.fixtureService));
  }

  addPanTiltEffect() {
    this.addEffect(new EffectPanTilt(this.uuidService, this.fixtureService));
  }

  openEffect(effect: Effect, event: any) {
    if (event) {
      this.effectService.selectedEffect = effect;
    } else {
      if (this.effectService.selectedEffect == effect) {
        this.effectService.selectedEffect = undefined;
      }
    }
  }

}
