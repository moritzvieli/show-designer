import { Component, OnInit } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureCapabilityType } from '../../models/fixture-capability';
import { FixtureService } from '../../services/fixture.service';

@Component({
  selector: 'app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css']
})
export class FixtureCapabilityComponent implements OnInit {

  constructor(
    private presetService: PresetService,
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
  }

  showCapability(type: FixtureCapabilityType, channelName?: string): boolean {
    // has at least one fixture of the selected preset the required capability
    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let channels = this.fixtureService.getChannelsByFixture(fixture);
console.log(channels);
      for (let channelFineIndex of channels) {
        if (channelFineIndex.fixtureChannel) {
          if (channelFineIndex.fixtureChannel.capability.type == type && (!channelName || channelFineIndex.channelName == channelName)) {
            return true;
          }
        }
      }
    }
    return false;
  }

}
