import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { EffectService } from '../services/effect.service';
import { FixtureService } from '../services/fixture.service';
import { MovingHead } from '../models/moving-head';
import { UuidService } from '../services/uuid.service';
import { SceneService } from '../services/scene.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {

  constructor(
    private effectService: EffectService,
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    private sceneService: SceneService) { }

  ngOnInit() {
    this.addMovingHead();
    this.addMovingHead();
    this.addMovingHead();
  }

  deleteFixture() {
    // TODO Also delete the all sceneFixtureProperties for all scenes, if any
  }

  addMovingHead() {
    let movingHead = new MovingHead(this.uuidService);
    movingHead.isSelected = true;

    if (this.effectService.selectedEffect) {
      this.effectService.selectedEffect.fixtures.push(movingHead);
    }

    this.fixtureService.addFixture(movingHead);
  }

  selectFixture(event: any, fixture: Fixture) {
    if (fixture.isSelected) {
      // Delete current scene effects
      if (this.effectService.selectedEffect) {
        for (let i = 0; i < this.effectService.selectedEffect.fixtures.length; i++) {
          if (this.effectService.selectedEffect.fixtures[i].uuid == fixture.uuid) {
            this.effectService.selectedEffect.fixtures.splice(i, 1);
            break;
          }
        }
      }

      // Deactivate current base properties
      for (let fixtureProperty of this.sceneService.getSelectedScenesFixtureProperties(fixture)) {
        if (fixtureProperty.fixture.uuid == fixture.uuid) {
          fixtureProperty.active = false;
        }
      }
    } else {
      // Add current scene effects
      if (this.effectService.selectedEffect) {
        this.effectService.selectedEffect.fixtures.push(fixture);
      }

      // Activate current base properties
      for (let fixtureProperty of this.sceneService.getSelectedScenesFixtureProperties(fixture)) {
        fixtureProperty.active = true;
      }
    }

    fixture.isSelected = !fixture.isSelected;
  }

}
