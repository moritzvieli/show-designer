import { Component, OnInit } from '@angular/core';
import { EffectCurve } from '../models/effect-curve';
import { UuidService } from '../services/uuid.service';
import { EffectService } from '../services/effect.service';
import { EffectPanTilt } from '../models/effect-pan-tilt';
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
    public presetService: PresetService,
    public effectService: EffectService,
  ) { }

  ngOnInit() {
  }

  private addEffect(effect: Effect) {
    this.effectService.selectedEffect = effect;

    if(this.presetService.selectedPreset) {
      this.presetService.selectedPreset.effects.push(effect);
    }
  }

  addCurveEffect() {
    let effect = new EffectCurve();
    effect.uuid = this.uuidService.getUuid();
    this.addEffect(effect);
  }

  addPanTiltEffect() {
    this.addEffect(new EffectPanTilt());
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
