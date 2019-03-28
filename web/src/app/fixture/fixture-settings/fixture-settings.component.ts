import { Component, OnInit } from '@angular/core';
import { FixtureService } from 'src/app/services/fixture.service';

@Component({
  selector: 'app-fixture-settings',
  templateUrl: './fixture-settings.component.html',
  styleUrls: ['./fixture-settings.component.css']
})
export class FixtureSettingsComponent implements OnInit {

  dmxChannels: number[] = [];

  constructor(
    private fixtureService: FixtureService
  ) {
    for(let i = 0; i < 512; i++) {
      this.dmxChannels.push(0);
    }
  }

  ngOnInit() {
  }

}
