import { Component, OnInit } from '@angular/core';
import { Positioning } from '../../../models/fixture';
import { FixtureService } from '../../../services/fixture.service';

@Component({
  selector: 'app-fixture-settings-position',
  templateUrl: './fixture-settings-position.component.html',
  styleUrls: ['./fixture-settings-position.component.css']
})
export class FixtureSettingsPositionComponent implements OnInit {

  selectedPositioning: string = Positioning[Positioning.topFront];

  constructor(
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
  }

  changePosition(positioningStr: string) {
    let positioning: Positioning = Positioning[positioningStr];

    for (let fixture of this.fixtureService.selectedSettingsFixtures) {
      fixture.positioning = positioning;
    }
  }

  changePositionManual(position: string, event: any) {
    for (let fixture of this.fixtureService.selectedSettingsFixtures) {
      if (position == 'x') {
        fixture.positionX = event.newValue;
      } else if (position == 'y') {
        fixture.positionY = event.newValue;
      } else if (position == 'z') {
        fixture.positionZ = event.newValue;
      }
    }
  }

}
