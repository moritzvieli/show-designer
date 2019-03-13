import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { FixtureService } from '../services/fixture.service';
import { UuidService } from '../services/uuid.service';
import { FixtureTemplate, FixtureType } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { FixtureProperty, FixturePropertyType } from '../models/fixture-property';
import { FixturePropertyRange } from '../models/fixture-property-range';
import { PresetService } from '../services/preset.service';
import { Universe } from '../models/universe';
import { UniverseService } from '../services/universe.service';
import { FixturePropertyValue } from '../models/fixture-property-value';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {

  constructor(
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    private presetService: PresetService,
    private universeService: UniverseService) { }

  ngOnInit() {
    // TODO Remove this test part
    let fixtureMode = new FixtureMode(this.uuidService);
    fixtureMode.channelCount = 6;

    let universe = new Universe(this.uuidService);
    this.universeService.universes.push(universe);

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
    this.fixtureService.fixtureTemplates.push(fixtureTemplate);

    let defaultValue: FixturePropertyValue;

    let fixture = new Fixture(this.uuidService);
    fixture.fixtureTemplateUuid = fixtureTemplate.uuid;
    fixture.firstChannel = 1;
    fixture.name = 'MH1';
    fixture.modeUuid = fixtureMode.uuid;
    fixture.universeUuid = universe.uuid;
    defaultValue = new FixturePropertyValue();
    defaultValue.fixturePropertyType = FixturePropertyType.pan;
    defaultValue.value = 127;
    fixture.fixturePropertyValues.push(defaultValue);
    defaultValue = new FixturePropertyValue();
    defaultValue.fixturePropertyType = FixturePropertyType.tilt;
    defaultValue.value = 127;
    fixture.fixturePropertyValues.push(defaultValue);
    this.fixtureService.addFixture(fixture);

    fixture = new Fixture(this.uuidService);
    fixture.fixtureTemplateUuid = fixtureTemplate.uuid;
    fixture.firstChannel = 7;
    fixture.name = 'MH2';
    fixture.modeUuid = fixtureMode.uuid;
    fixture.universeUuid = universe.uuid;
    defaultValue.fixturePropertyType = FixturePropertyType.pan;
    defaultValue.value = 127;
    fixture.fixturePropertyValues.push(defaultValue);
    defaultValue = new FixturePropertyValue();
    defaultValue.fixturePropertyType = FixturePropertyType.tilt;
    defaultValue.value = 127;
    fixture.fixturePropertyValues.push(defaultValue);
    this.fixtureService.addFixture(fixture);

    fixture = new Fixture(this.uuidService);
    fixture.fixtureTemplateUuid = fixtureTemplate.uuid;
    fixture.firstChannel = 13;
    fixture.name = 'MH3';
    fixture.modeUuid = fixtureMode.uuid;
    fixture.universeUuid = universe.uuid;
    defaultValue.fixturePropertyType = FixturePropertyType.pan;
    defaultValue.value = 127;
    fixture.fixturePropertyValues.push(defaultValue);
    defaultValue = new FixturePropertyValue();
    defaultValue.fixturePropertyType = FixturePropertyType.tilt;
    defaultValue.value = 127;
    fixture.fixturePropertyValues.push(defaultValue);
    this.fixtureService.addFixture(fixture);
  }

  deleteFixture() {
    // TODO Also delete the all sceneFixtureProperties for all scenes, if any
  }

  selectFixture(event: any, fixture: Fixture) {
    this.presetService.switchFixtureSelection(fixture);
  }

}
