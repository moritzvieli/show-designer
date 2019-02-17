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

  channelOccupied(index: number): boolean {
    for(let fixture of this.fixtureService.fixtures) {
      if(index >= fixture.dmxFirstChannel && index < fixture.dmxFirstChannel + fixture.dmxChannelCount) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedStart(index: number): boolean {
    for(let fixture of this.fixtureService.fixtures) {
      if(index == fixture.dmxFirstChannel) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedEnd(index: number): boolean {
    for(let fixture of this.fixtureService.fixtures) {
      if(index == fixture.dmxFirstChannel + fixture.dmxChannelCount - 1) {
        return true;
      }
    }

    return false;
  }

}
