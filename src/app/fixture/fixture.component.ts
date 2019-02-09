import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { EffectService } from '../services/effect.service';
import { FixtureService } from '../services/fixture.service';
import { SceneService } from '../services/scene.service';
import { SceneFixtureProperties } from '../models/scene-fixture-properties';
import { MovingHead } from '../models/moving-head';
import { UuidService } from '../services/uuid.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {

  constructor(
    private effectService: EffectService,
    public fixtureService: FixtureService,
    private sceneService: SceneService,
    private uuidService: UuidService)
  { }

  ngOnInit() {
    this.addMovingHead();
    this.addMovingHead();
    this.addMovingHead();
  }

  private addSceneFixtureSettings(fixture: Fixture) {
    // Add the base settings for this new fixture to all scenes
    for (let scene of this.sceneService.scenes) {
      let sceneFixtureProperties = new SceneFixtureProperties();
      sceneFixtureProperties.fixture = fixture;
      // Create a new instance of fixture
      sceneFixtureProperties.properties = new (fixture.constructor as any);
      scene.sceneFixturePropertiesList.push(sceneFixtureProperties);
    }
  }

  addMovingHead() {
    let movingHead = new MovingHead(this.uuidService);
    movingHead.positionY = 30;
    movingHead.isSelected = true;

    if (this.effectService.selectedEffect) {
      this.effectService.selectedEffect.fixtures.push(movingHead);
    }

    this.fixtureService.addFixture(movingHead);
    this.addSceneFixtureSettings(movingHead);
  }

  selectFixture(event, item: Fixture) {
    if (item.isSelected) {
      // Delete current effect
      if (this.effectService.selectedEffect) {
        for (var i = 0; i < this.effectService.selectedEffect.fixtures.length; i++) {
          if (this.effectService.selectedEffect.fixtures[i].uuid == item.uuid) {
            this.effectService.selectedEffect.fixtures.splice(i, 1);
            break;
          }
        }
      }
    } else {
      // Add current effect
      if (this.effectService.selectedEffect) {
        this.effectService.selectedEffect.fixtures.push(item);
      }
    }

    item.isSelected = !item.isSelected;
  }

}
