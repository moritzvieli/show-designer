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
      let template = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
      let mode = this.fixtureService.getModeByUuid(fixture.modeUuid, template);

      if(index >= fixture.firstChannel && index < fixture.firstChannel + mode.channelCount) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedStart(index: number): boolean {
    for(let fixture of this.fixtureService.fixtures) {
      if(index == fixture.firstChannel) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedEnd(index: number): boolean {
    for(let fixture of this.fixtureService.fixtures) {
      let template = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
      let mode = this.fixtureService.getModeByUuid(fixture.modeUuid, template);

      if(index == fixture.firstChannel + mode.channelCount - 1) {
        return true;
      }
    }

    return false;
  }

}
