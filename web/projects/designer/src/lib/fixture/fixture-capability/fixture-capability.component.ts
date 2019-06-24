import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureService } from '../../services/fixture.service';
import { FixtureTemplate } from '../../models/fixture-template';
import { FixtureWheelSlotType } from '../../models/fixture-wheel-slot';
import { CachedFixtureChannel } from '../../models/cached-fixture-channel';

@Component({
  selector: 'app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityComponent implements OnInit {

  // map containing the template and the channel name containing the wheel
  colorWheelChannels: Map<FixtureTemplate, CachedFixtureChannel> = new Map<FixtureTemplate, CachedFixtureChannel>();

  constructor(
    public presetService: PresetService,
    private fixtureService: FixtureService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.presetService.fixtureSelectionChanged.subscribe(() => {
      this.update();
    });

    this.presetService.previewSelectionChanged.subscribe(() => {
      this.update();
    });
  }

  ngOnInit() {
  }

  private wheelInList(wheels: Map<FixtureTemplate, CachedFixtureChannel>, template: FixtureTemplate, channel: CachedFixtureChannel) {
    wheels.forEach((existingChannel: CachedFixtureChannel, template: FixtureTemplate) => {
      if (template == template && existingChannel.channelName == channel.channelName) {
        return true;
      }
    });

    return false;
  }

  private updateColorWheels() {
    this.colorWheelChannels = new Map<FixtureTemplate, CachedFixtureChannel>();

    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
      for (let channel of fixture.channels) {
        for (let capability of channel.capabilities) {
          if (capability.wheel && capability.wheelSlots && capability.wheelSlots.length > 0) {
            if (this.fixtureService.wheelHasSlotType(capability.wheel, FixtureWheelSlotType.Color)) {
              // color wheel
              if (!this.wheelInList(this.colorWheelChannels, fixture.template, channel)) {
                this.colorWheelChannels.set(fixture.template, channel);
              }
            } else if (this.fixtureService.wheelHasSlotType(capability.wheel, FixtureWheelSlotType.Gobo)) {
              // gobo wheel
              // TODO
            }
          }
        }
      }
    }
  }

  private update() {
    this.updateColorWheels();
    this.changeDetectorRef.detectChanges();
  }

  isChrome(): boolean {
    if (navigator.appVersion.indexOf("Chrome/") != -1) {
      return true;
    }
    return false;
  }

}
