import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { PresetService } from '../services/preset.service';
import { ProjectService } from '../services/project.service';
import { FixturePoolService } from '../services/fixture-pool.service';
import { FixtureService } from '../services/fixture.service';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {

  constructor(
    public projectService: ProjectService,
    public presetService: PresetService,
    private fixturePoolService: FixturePoolService,
    public fixtureService: FixtureService
  ) { }

  ngOnInit() { }

  fixtureIsSelected(fixture: Fixture): boolean {
    if (this.fixtureService.settingsSelection) {
      return this.fixtureService.settingsFixtureIsSelected(fixture);
    } else {
      return this.presetService.fixtureIsSelected(fixture);
    }
  }

  selectFixture(event: any, fixture: Fixture) {
    if (this.fixtureService.settingsSelection) {
      this.fixtureService.switchSettingsFixtureSelection(fixture);
      this.presetService.fixtureSelectionSettingsChanged.next();
    } else {
      this.presetService.switchFixtureSelection(fixture);
      this.presetService.fixtureSelectionChanged.next();
    }
  }

  selectAll() {
    this.presetService.selectAllFixtures();
  }

  selectNone() {
    this.presetService.selectNoFixtures();
  }

  openFixturePool() {
    this.fixturePoolService.open();
  }

}
