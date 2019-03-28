import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { FixtureService } from '../services/fixture.service';
import { PresetService } from '../services/preset.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {

  constructor(
    public fixtureService: FixtureService,
    private presetService: PresetService) { }

  ngOnInit() {}

  deleteFixture() {
    // TODO Also delete the all sceneFixtureProperties for all scenes, if any
  }

  selectFixture(event: any, fixture: Fixture) {
    this.presetService.switchFixtureSelection(fixture);
    this.presetService.fixtureSelectionChanged.next();
  }

}
