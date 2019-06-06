import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureCapabilityType } from '../../models/fixture-capability';
import { FixtureService } from '../../services/fixture.service';
import { FixtureWheel } from '../../models/fixture-wheel';
import { FixtureTemplate, FixtureType } from '../../models/fixture-template';
import { FixtureWheelSlotType } from '../../models/fixture-wheel-slot';

@Component({
  selector: 'app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityComponent implements OnInit {

  // wheels containing the template and the wheel name
  colorWheels: Map<FixtureTemplate, string> = new Map<FixtureTemplate, string>();

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

  private wheelInList(wheels: Map<FixtureTemplate, string>, template: FixtureTemplate, name: string) {
    wheels.forEach((wheelName: string, template: FixtureTemplate) => {
      if (template == template && wheelName == name) {
        return true;
      }
    });

    return false;
  }

  private wheelHasSlotType(wheel: FixtureWheel, slotType: FixtureWheelSlotType): boolean {
    for (let slot of wheel.slots) {
      if (slot.type == slotType) {
        return true;
      }
    }

    return false;
  }

  private updateColorWheels() {
    this.colorWheels = new Map<FixtureTemplate, string>();

    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let channels = this.fixtureService.getChannelsByFixture(fixture);
      for (let channelFineIndex of channels) {
        for (let capability of this.fixtureService.getCapabilitiesByChannelName(channelFineIndex.channelName, channelFineIndex.fixtureTemplate.uuid)) {
          let wheelName = capability.wheel || channelFineIndex.channelName;
          let wheel = this.fixtureService.getWheelByName(channelFineIndex.fixtureTemplate, wheelName);
          if (wheel && wheel.slots && wheel.slots.length > 0) {
            if (this.wheelHasSlotType(wheel, FixtureWheelSlotType.Color)) {
              // color wheel
              if (!this.wheelInList(this.colorWheels, channelFineIndex.fixtureTemplate, wheelName)) {
                this.colorWheels.set(channelFineIndex.fixtureTemplate, wheelName);
              }
            } else if (this.wheelHasSlotType(wheel, FixtureWheelSlotType.Gobo)) {
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

  private hasCapabilityType(type: FixtureCapabilityType): boolean {
    // there is at least one channel with at least one intensity capability
    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let channels = this.fixtureService.getChannelsByFixture(fixture);
      for (let channelFineIndex of channels) {
        if (channelFineIndex.fixtureChannel) {
          if (this.fixtureService.channelHasCapabilityType(channelFineIndex.fixtureChannel, type)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  showDimmer(): boolean {
    return this.hasCapabilityType(FixtureCapabilityType.Intensity);
  }

  showColor(): boolean {
    // TODO optionally color temperature and color white (see stairville/mh-100)

    // one of the templates has a color intensity
    if (this.hasCapabilityType(FixtureCapabilityType.ColorIntensity)) {
      return true;
    }

    // different color wheels are involved
    if (this.colorWheels.size > 1) {
      return true;
    }

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
