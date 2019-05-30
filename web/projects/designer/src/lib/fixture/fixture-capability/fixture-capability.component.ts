import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureCapabilityType } from '../../models/fixture-capability';
import { FixtureService } from '../../services/fixture.service';

@Component({
  selector: 'app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityComponent implements OnInit {

  constructor(
    public presetService: PresetService,
    private fixtureService: FixtureService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.presetService.fixtureSelectionChanged.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnInit() {
  }

  showDimmer(): boolean {
    // there is at least one channel with at least one intensity capability
    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let channels = this.fixtureService.getChannelsByFixture(fixture);
      for (let channelFineIndex of channels) {
        if (channelFineIndex.fixtureChannel) {
          if (this.fixtureService.channelHasCapabilityType(channelFineIndex.fixtureChannel, FixtureCapabilityType.Intensity)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  showColor(): boolean {
    // TODO there is at least one channel for each color, r, g and b
    // TODO optionally color temperature and color white (see stairville/mh-100)
    return false;
  }

  showPanTilt(): boolean {
    // TODO there is at least one pan and one tilt channel
    // TODO optionally endless pan/tilt and movement speed
    return false;
  }

  isChrome(): boolean {
    if (navigator.appVersion.indexOf("Chrome/") != -1) {
      return true;
    }
    return false;
  }

}
