import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { EffectService } from '../services/effect.service';
import { FixtureService } from '../services/fixture.service';
import { UuidService } from '../services/uuid.service';
import { SceneService } from '../services/scene.service';
import { FixtureTemplate, FixtureType } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { FixtureProperty, FixturePropertyType } from '../models/fixture-property';
import { FixturePropertyRange } from '../models/fixture-property-range';

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
    // TODO Remove this test part
    let fixtureMode = new FixtureMode();
    fixtureMode.channelCount = 6;

    let fixtureProperty = new FixtureProperty();
    fixtureProperty.type = FixturePropertyType.colorRed;
    fixtureMode.fixtureProperties.push(fixtureProperty);
    fixtureProperty = new FixtureProperty();
    fixtureProperty.type = FixturePropertyType.colorGreen;
    fixtureMode.fixtureProperties.push(fixtureProperty);
    fixtureProperty = new FixtureProperty();
    fixtureProperty.type = FixturePropertyType.colorBlue;
    fixtureMode.fixtureProperties.push(fixtureProperty);

    fixtureProperty = new FixtureProperty();
    fixtureProperty.type = FixturePropertyType.pan;
    fixtureMode.fixtureProperties.push(fixtureProperty);
    fixtureProperty = new FixtureProperty();
    fixtureProperty.type = FixturePropertyType.tilt;
    fixtureMode.fixtureProperties.push(fixtureProperty);

    fixtureProperty = new FixtureProperty();
    fixtureProperty.type = FixturePropertyType.custom;
    fixtureMode.fixtureProperties.push(fixtureProperty);

    let fixturePropertyRange = new FixturePropertyRange(this.uuidService);
    fixturePropertyRange.name = 'Closed';
    fixturePropertyRange.channelFrom = 0;
    fixturePropertyRange.channelTo = 99;
    fixtureProperty.fixturePropertyRanges.push(fixturePropertyRange);

    fixturePropertyRange = new FixturePropertyRange(this.uuidService);
    fixturePropertyRange.name = 'Strobe';
    fixturePropertyRange.channelFrom = 100;
    fixturePropertyRange.channelTo = 255;
    fixturePropertyRange.useSlider = true;
    fixtureProperty.fixturePropertyRanges.push(fixturePropertyRange);

    let fixtureTemplate = new FixtureTemplate(this.uuidService);
    fixtureTemplate.type = FixtureType.movingHead;
    fixtureTemplate.manufacturer = 'Stairville';
    fixtureTemplate.name = 'MH2018';
    fixtureTemplate.fixtureModes.push(fixtureMode);

    let fixture = new Fixture(this.uuidService);
    fixture.fixtureTemplateUuid = fixtureTemplate.uuid;
    fixture.firstChannel = 1;
    this.fixtureService.addFixture(fixture);

    fixture = new Fixture(this.uuidService);
    fixture.fixtureTemplateUuid = fixtureTemplate.uuid;
    fixture.firstChannel = 7;
    this.fixtureService.addFixture(fixture);

    fixture = new Fixture(this.uuidService);
    fixture.fixtureTemplateUuid = fixtureTemplate.uuid;
    fixture.firstChannel = 13;
    this.fixtureService.addFixture(fixture);
  }

  deleteFixture() {
    // TODO Also delete the all sceneFixtureProperties for all scenes, if any
  }

  selectFixture(event: any, fixture: Fixture) {
    if (this.fixtureService.fixtureIsSelected(fixture)) {
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

    this.fixtureService.switchFixtureSelection(fixture);
  }

}
