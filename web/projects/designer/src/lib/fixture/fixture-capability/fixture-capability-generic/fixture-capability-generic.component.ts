import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { FixtureChannelFineIndex } from '../../../models/fixture-channel-fine-index';
import { FixtureService } from '../../../services/fixture.service';
import { FixtureCapability } from '../../../models/fixture-capability';

@Component({
  selector: 'app-fixture-capability-generic',
  templateUrl: './fixture-capability-generic.component.html',
  styleUrls: ['./fixture-capability-generic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityGenericComponent implements OnInit {

  @ViewChild('slider')
  sliderElement;

  capabilities: FixtureCapability[];
  selectedCapability: FixtureCapability;
  value: number;
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
    return this.value;
  }

  setValue(value: any) {
    if(isNaN(value) || value < this.getRangeMin() || value > this.getRangeMax()) {
      return;
    }
    
    this.value = value;
    this.changeDetectorRef.detectChanges();
  }

  getDefaultValue(): number {
    // TODO
    return 0;
  }

  changeActive(active: boolean) {
    if(active) {
      this.value = 0;
    } else {
      this.value = undefined;
      this.selectedCapability = this.capabilities[0];
    }
  }

  capabilitySelected() {
    this.value = this.selectedCapability.dmxRange[0];
  }

}
