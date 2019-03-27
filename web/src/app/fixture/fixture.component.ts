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
    // let universe = new Universe(this.uuidService);
    // this.universeService.universes.push(universe);

    // let defaultValue: FixturePropertyValue;

    // let fixture = new Fixture(this.uuidService);
    // fixture.fixtureTemplateUuid = this.fixtureService.getTemplates()[0].uuid;
    // fixture.firstChannel = 1;
    // fixture.name = 'MH1';
    // fixture.modeUuid = fixtureMode.uuid;
    // fixture.universeUuid = universe.uuid;
    // defaultValue = new FixturePropertyValue();
    // defaultValue.fixturePropertyType = FixturePropertyType.pan;
    // defaultValue.value = 127;
    // fixture.fixturePropertyValues.push(defaultValue);
    // defaultValue = new FixturePropertyValue();
    // defaultValue.fixturePropertyType = FixturePropertyType.tilt;
    // defaultValue.value = 127;
    // fixture.fixturePropertyValues.push(defaultValue);
    // this.fixtureService.addFixture(fixture);

    // fixture = new Fixture(this.uuidService);
    // fixture.fixtureTemplateUuid = this.fixtureService.getTemplates()[0].uuid;
    // fixture.firstChannel = 7;
    // fixture.name = 'MH2';
    // fixture.modeUuid = fixtureMode.uuid;
    // fixture.universeUuid = universe.uuid;
    // defaultValue = new FixturePropertyValue();
    // defaultValue.fixturePropertyType = FixturePropertyType.pan;
    // defaultValue.value = 127;
    // fixture.fixturePropertyValues.push(defaultValue);
    // defaultValue = new FixturePropertyValue();
    // defaultValue.fixturePropertyType = FixturePropertyType.tilt;
    // defaultValue.value = 127;
    // fixture.fixturePropertyValues.push(defaultValue);
    // this.fixtureService.addFixture(fixture);

    // fixture = new Fixture(this.uuidService);
    // fixture.fixtureTemplateUuid = this.fixtureService.getTemplates()[0].uuid;
    // fixture.firstChannel = 13;
    // fixture.name = 'MH3';
    // fixture.modeUuid = fixtureMode.uuid;
    // fixture.universeUuid = universe.uuid;
    // defaultValue = new FixturePropertyValue();
    // defaultValue.fixturePropertyType = FixturePropertyType.pan;
    // defaultValue.value = 127;
    // fixture.fixturePropertyValues.push(defaultValue);
    // defaultValue = new FixturePropertyValue();
    // defaultValue.fixturePropertyType = FixturePropertyType.tilt;
    // defaultValue.value = 127;
    // fixture.fixturePropertyValues.push(defaultValue);
    // this.fixtureService.addFixture(fixture);
  }

  deleteFixture() {
    // TODO Also delete the all sceneFixtureProperties for all scenes, if any
  }

  selectFixture(event: any, fixture: Fixture) {
    this.presetService.switchFixtureSelection(fixture);
    this.presetService.fixtureSelectionChanged.next();
  }

}
