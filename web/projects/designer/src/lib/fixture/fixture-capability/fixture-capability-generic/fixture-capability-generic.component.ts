import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FixtureChannelFineIndex } from '../../../models/fixture-channel-fine-index';
import { FixtureService } from '../../../services/fixture.service';
import { FixtureCapability } from '../../../models/fixture-capability';
import { PresetService } from '../../../services/preset.service';

@Component({
  selector: 'app-fixture-capability-generic',
  templateUrl: './fixture-capability-generic.component.html',
  styleUrls: ['./fixture-capability-generic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityGenericComponent implements OnInit {

  capabilities: FixtureCapability[];
  selectedCapability: FixtureCapability;
  _channel: FixtureChannelFineIndex;

  @Input()
  set channel(value: FixtureChannelFineIndex) {
    this._channel = value;
    this.updateChannel();
  }

  @Input()
  capabilityIndex: number;

  constructor(
    private fixtureService: FixtureService,
    private presetService: PresetService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  private updateChannel() {
    this.capabilities = this.fixtureService.getCapabilitiesByChannel(this._channel.fixtureChannel);
    this.selectedCapability = this.capabilities[0];
  }

  capabilityHasRange(): boolean {
    if(this.capabilities.length == 1) {
      return true;
    }

    if (this.selectedCapability.angleStart) {
      return true;
    }

    return false;
  }

  getRangeMin(): number {
    if (this.selectedCapability.dmxRange.length > 0) {
      return this.selectedCapability.dmxRange[0];
    }

    return 0;
  }

  getRangeMax(): number {
    if (this.selectedCapability.dmxRange.length > 0) {
      return this.selectedCapability.dmxRange[1];
    }

    return this.fixtureService.getMaxValueByChannel(this._channel.fixtureChannel);
  }

  ngOnInit() {
  }

  getValue(): number {
    return this.presetService.getChannelValue(this._channel.channelName, this._channel.fixtureTemplate.uuid);
  }

  setValue(value: any) {
    if(isNaN(value) || value < this.getRangeMin() || value > this.getRangeMax()) {
      return;
    }
    
    this.presetService.setChannelValue(this._channel.channelName, this._channel.fixtureTemplate.uuid, value);
    this.changeDetectorRef.detectChanges();
  }

  getDefaultValue(): number {
    if(this._channel.fixtureChannel.defaultValue) {
      return this.fixtureService.getDefaultValueByChannel(this._channel.fixtureChannel);
    }

    return 0;
  }

  changeActive(active: boolean) {
    if(active) {
      this.setValue(this.getDefaultValue());
    } else {
      this.presetService.deleteChannelValue(this._channel.channelName, this._channel.fixtureTemplate.uuid);
      this.selectedCapability = this.capabilities[0];
    }
  }

  capabilitySelected() {
    // select the min value of the selected capability
    this.setValue(this.selectedCapability.dmxRange[0]);
  }

}
