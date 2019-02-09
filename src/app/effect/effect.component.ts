import { Component, OnInit } from '@angular/core';
import { EffectCurve } from '../models/effect-curve';
import { UuidService } from '../services/uuid.service';
import { SceneService } from '../services/scene.service';
import { EffectService } from '../services/effect.service';
import { EffectPanTilt } from '../models/effect-pan-tilt';
import { FixtureService } from '../services/fixture.service';
import { Effect } from '../models/effect';

@Component({
  selector: 'app-effect',
  templateUrl: './effect.component.html',
  styleUrls: ['./effect.component.css']
})
export class EffectComponent implements OnInit {

  constructor(
    private uuidService: UuidService,
    private sceneService: SceneService,
    public effectService: EffectService,
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
    this.addPanTiltEffect();
  }

  addCurveEffect() {
    let effect = new EffectCurve(this.uuidService, this.fixtureService);
    this.effectService.selectedEffect = effect;
    this.sceneService.getCurrentScene().effects.push(effect);
  }

  addPanTiltEffect() {
    let effect = new EffectPanTilt(this.uuidService, this.fixtureService);
    this.effectService.selectedEffect = effect;
    this.sceneService.getCurrentScene().effects.push(effect);
  }

  openEffect(effect: Effect, event: any) {
    // Select all fixtures with this effect and unselect all other
    if (event) {
      this.fixtureService.fixtures.forEach(fixture => {
        let effectSelected = false;

        for (let effectFixture of effect.fixtures) {
          if (effectFixture.uuid == fixture.uuid) {
            effectSelected = true;
          }
        }

        if (effectSelected) {
          fixture.isSelected = true;
        } else {
          fixture.isSelected = false;
        }
      });

      this.effectService.selectedEffect = effect;
    } else {
      if (this.effectService.selectedEffect == effect) {
        this.effectService.selectedEffect = undefined;
      }
    }
  }

}
