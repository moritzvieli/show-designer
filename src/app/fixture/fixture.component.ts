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

  addMovingHead() {
    let movingHead = new MovingHead(this.uuidService);
    movingHead.positionY = 30;
    movingHead.isSelected = true;

    if (this.effectService.selectedEffect) {
      this.effectService.selectedEffect.fixtures.push(movingHead);
    }

    this.fixtureService.addFixture(movingHead);
  }

  selectFixture(event, item: Fixture) {
    if (this.effectService.selectedEffect) {
      if (item.isSelected) {
        // Delete current effect
        for (var i = 0; i < this.effectService.selectedEffect.fixtures.length; i++) {
          if (this.effectService.selectedEffect.fixtures[i].uuid == item.uuid) {
            this.effectService.selectedEffect.fixtures.splice(i, 1);
            break;
          }
        }
      } else {
        // Add current effect
        this.effectService.selectedEffect.fixtures.push(item);
      }

      item.isSelected = !item.isSelected;
    }
  }

  fixtureHasPropertiesSet(fixture: Fixture) {
    for (let scene of this.sceneService.getSelectedScenes()) {
      for (let fixtureProperty of scene.sceneFixturePropertiesList) {
        if (fixtureProperty.fixture.uuid == fixture.uuid) {
          return true;
        }
      }
    }

    return false;
  }

  fixtureDeleteProperties(fixture: Fixture) {
    for (let scene of this.sceneService.getSelectedScenes()) {
      for (let i = 0; scene.sceneFixturePropertiesList.length; i++) {
        if (scene.sceneFixturePropertiesList[i].fixture.uuid == fixture.uuid) {
          scene.sceneFixturePropertiesList.splice(i, 1);
          break;
        }
      }
    }

    return false;
  }

}
