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

  constructor(private fixtureService: FixtureService) { }

  ngOnInit() {
  }

  changePosition(positioningStr: string) {
    let positioning: Positioning = Positioning[positioningStr];

    // TODO Update the position for which fixtures? Are selected fixtures for the setting tracked separately in the fixture service?
    // --> Move the whole settings part into the library editor modal?
    // this.fixtureService.fixtures.forEach(fixture => {
    //   if (fixture.isSelected) {
    //     fixture.positioning = positioning;
    //   }
    // });
  }

  changeSlider(event: any) {
    // TODO
  }

}
