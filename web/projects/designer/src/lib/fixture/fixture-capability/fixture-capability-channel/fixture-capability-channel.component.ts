import { Component, OnInit, Input, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { PresetService } from '../../../services/preset.service';
import { CachedFixtureChannel } from '../../../models/cached-fixture-channel';
import { CachedFixtureCapability } from '../../../models/cached-fixture-capability';
import { FixtureTemplate } from '../../../models/fixture-template';

@Component({
  selector: 'app-fixture-capability-channel',
  templateUrl: './fixture-capability-channel.component.html',
  styleUrls: ['./fixture-capability-channel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityChannelComponent implements OnInit {

  @ViewChild('sliderValue') sliderValue: ElementRef;

  selectedCapability: CachedFixtureCapability;
  _channel: CachedFixtureChannel;

  @Input()
  template: FixtureTemplate;

  @Input()
  set channel(value: CachedFixtureChannel) {
    this._channel = value;
    this.updateChannel();
  }

  @Input()
  capabilityIndex: number;

  constructor(
    private presetService: PresetService
  ) {
  }

  private updateChannel() {
    this.selectedCapability = this._channel.capabilities[0];

    let currentValue = this.getValue();
    if (currentValue >= 0) {
      for (let capability of this._channel.capabilities) {
        if (capability.capability.dmxRange.length > 0 && capability.centerValue == currentValue) {
          this.selectedCapability = capability;
          break;
        }
      }
    }
  }

  capabilityHasRange(): boolean {
    if (this._channel.capabilities && this._channel.capabilities.length == 1) {
      return true;
    }

    if (this.selectedCapability && this.selectedCapability.capability.angleStart) {
      return true;
    }

    return false;
  }

  getRangeMin(): number {
    if (this.selectedCapability.capability.dmxRange.length > 0) {
      return this.selectedCapability.capability.dmxRange[0];
    }

    return 0;
  }

  getRangeMax(): number {
    if (this.selectedCapability.capability.dmxRange.length > 0) {
      return this.selectedCapability.capability.dmxRange[1];
    }

    return this._channel.maxValue;
  }

  ngOnInit() {
  }

  getValue(): number {
    return this.presetService.getChannelValue(this._channel.channelName, this.template.uuid);
  }

  setValue(value: any, ignoreCapabilityRange: boolean = false) {
    if (isNaN(value)) {
      return;
    }

    if (!ignoreCapabilityRange && (value < this.getRangeMin() || value > this.getRangeMax())) {
      return;
    }

    this.presetService.setChannelValue(this._channel.channelName, this.template.uuid, value);
    if (this.sliderValue) {
      // update the value without change detector for performance reasons
      // TODO use the same technique in the dimmer/pan/tilt/color sliders
      this.sliderValue.nativeElement.value = value;
    }
  }

  getDefaultValue(): number {
    if (this._channel.defaultValue) {
      return this._channel.defaultValue;
    }

    return 0;
  }

  changeActive(active: boolean) {
    if (active) {
      this.setValue(this.getDefaultValue(), true);
    } else {
      this.presetService.deleteChannelValue(this._channel.channelName, this.template.uuid);
      this.selectedCapability = this._channel.capabilities[0];
    }
  }

  capabilitySelected() {
    // select the center value of the selected capability
    if (this.capabilityHasRange) {
      this.setValue(this.selectedCapability.capability.dmxRange[0], true);
    } else {
      this.setValue(this.selectedCapability.centerValue, true);
    }
  }

}
