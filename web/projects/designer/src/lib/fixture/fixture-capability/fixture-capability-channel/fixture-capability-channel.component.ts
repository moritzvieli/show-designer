import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CachedFixtureCapability } from '../../../models/cached-fixture-capability';
import { CachedFixtureChannel } from '../../../models/cached-fixture-channel';
import { FixtureProfile } from '../../../models/fixture-profile';
import { PresetService } from '../../../services/preset.service';

@Component({
  selector: 'lib-app-fixture-capability-channel',
  templateUrl: './fixture-capability-channel.component.html',
  styleUrls: ['./fixture-capability-channel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityChannelComponent implements OnInit {
  @ViewChild('sliderValue', { static: false }) sliderValue: ElementRef;

  selectedCapability: CachedFixtureCapability;
  _channel: CachedFixtureChannel;

  rangeMin = 0;
  rangeMax = 0;
  defaultValue = 0;
  value = 0;
  templateValue = 0;

  valueSetTimer: any;

  @Input()
  profile: FixtureProfile;

  @Input()
  set channel(value: CachedFixtureChannel) {
    this._channel = value;
    this.updateChannel();
  }

  @Input()
  capabilityIndex: number;

  constructor(private presetService: PresetService) {}

  private updateChannel() {
    this.selectedCapability = this._channel.capabilities[0];

    this.value = this.presetService.getChannelValue(this._channel.name, this.profile.uuid);
    this.calculateTemplateValue();

    if (this.value >= 0) {
      for (const capability of this._channel.capabilities) {
        if (capability.capability.dmxRange.length > 0 && capability.centerValue === this.value) {
          this.selectedCapability = capability;
          break;
        }
      }
    }

    this.rangeMin = this.getRangeMin();
    this.rangeMax = this.getRangeMax();
    this.defaultValue = this.getDefaultValue();
  }

  capabilityHasRange(): boolean {
    if (this._channel.capabilities && this._channel.capabilities.length === 1) {
      return true;
    }

    if (this.selectedCapability && this.selectedCapability.capability.angleStart) {
      return true;
    }

    return false;
  }

  private getRangeMin(): number {
    if (this.selectedCapability.capability.dmxRange.length > 0) {
      return this.selectedCapability.capability.dmxRange[0];
    }

    return 0;
  }

  private getRangeMax(): number {
    if (this.selectedCapability.capability.dmxRange.length > 0) {
      return this.selectedCapability.capability.dmxRange[1];
    }

    return this._channel.maxValue;
  }

  ngOnInit() {}

  setValue(value: any, ignoreCapabilityRange: boolean = false) {
    if (isNaN(value)) {
      return;
    }

    if (!ignoreCapabilityRange && (value < this.getRangeMin() || value > this.getRangeMax())) {
      return;
    }

    this.value = value;
    this.calculateTemplateValue();

    this.presetService.setChannelValue(this._channel.name, this.profile.uuid, value);
    if (this.sliderValue) {
      // update the value without change detector for performance reasons and only in a specific
      // interval. each value set will trigger a layout/reflow event and slow down the performance
      // TODO use the same technique in the dimmer/pan/tilt/color sliders
      if (!this.valueSetTimer) {
        this.valueSetTimer = setTimeout(() => {
          this.sliderValue.nativeElement.value = this.value;
          this.valueSetTimer = undefined;
        }, 30);
      }
    }
    this.presetService.previewLive();
  }

  private calculateTemplateValue() {
    this.templateValue = this.value ? this.value : this.getDefaultValue();
  }

  private getDefaultValue(): number {
    if (this._channel.defaultValue) {
      return this._channel.defaultValue;
    }

    return 0;
  }

  changeActive(active: boolean) {
    if (active) {
      this.setValue(this.getDefaultValue(), true);
    } else {
      this.presetService.deleteChannelValue(this._channel.name, this.profile.uuid);
      this.selectedCapability = this._channel.capabilities[0];
      this.value = undefined;
      this.calculateTemplateValue();
    }
    this.presetService.previewLive();
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
