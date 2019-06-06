import { Component, OnInit, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PresetService } from '../../../services/preset.service';
import { FixtureWheel } from '../../../models/fixture-wheel';
import { FixtureTemplate } from '../../../models/fixture-template';
import { FixtureService } from '../../../services/fixture.service';
import { FixtureCapability, FixtureCapabilityType } from '../../../models/fixture-capability';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-fixture-capability-color-wheel',
  templateUrl: './fixture-capability-color-wheel.component.html',
  styleUrls: ['./fixture-capability-color-wheel.component.css']
})
export class FixtureCapabilityColorWheelComponent implements OnInit, OnDestroy {

  _fixtureTemplate: FixtureTemplate;
  _channelName: string;
  wheelName: string;
  wheel: FixtureWheel;
  slotCapabilities: FixtureCapability[];
  colorChangeSubscription: Subscription;

  @Input()
  set fixtureTemplate(value: FixtureTemplate) {
    this._fixtureTemplate = value;
    this.update();
  }

  @Input()
  set channelName(value: string) {
    this._channelName = value;
    this.update();
  }

  @Input()
  wheelIndex: number;

  @Input()
  showContainer: boolean = false;

  constructor(
    public presetService: PresetService,
    private changeDetectorRef: ChangeDetectorRef,
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
    this.colorChangeSubscription = this.presetService.fixtureColorChanged.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this.colorChangeSubscription.unsubscribe();
  }

  private update() {
    if (this._fixtureTemplate && this._channelName) {
      let channelCapabilities = this.fixtureService.getCapabilitiesByChannelName(this._channelName, this._fixtureTemplate.uuid);
      this.wheelName = undefined;
      this.slotCapabilities = [];

      // get the wheel name
      for (let capability of channelCapabilities) {
        if (capability.wheel) {
          this.wheelName = capability.wheel;
          break;
        }
      }
      if (!this.wheelName) {
        this.wheelName = this._channelName;
      }

      this.wheel = this.fixtureService.getWheelByName(this._fixtureTemplate, this.wheelName);

      // calculate all available slots
      let capabilities = this.fixtureService.getCapabilitiesByChannelName(this._channelName, this._fixtureTemplate.uuid);
      for (let capability of capabilities) {
        if (capability.type == FixtureCapabilityType.WheelSlot) {
          this.slotCapabilities.push(capability);
        }
      }
    }

    this.changeDetectorRef.detectChanges();
  }

  getCapabilityColorStyle(capability: FixtureCapability): any {
    let wheelSlots = this.fixtureService.getWheelSlots(this.wheel, capability.slotNumber);
    let property: string = 'background-color';
    let value: string = 'black';
    let colors: string[] = [];

    if (wheelSlots) {
      for (let slot of wheelSlots) {
        // calculate the color based on the color wheel slot
        if (slot.colors.length > 0) {
          colors = colors.concat(slot.colors);
        }
      }
    }

    if (colors.length > 1) {
      // mixed colors -> gradient
      let colorString: string;
      for (let color of colors) {
        if (colorString) {
          colorString += ', ';
        } else {
          colorString = '';
        }
        colorString += color;
      }
      property = 'background-image';
      value = 'linear-gradient(to bottom right, ' + colorString + ')';
    } else if (colors.length == 1) {
      value = colors[0];
    } else {
      value = '#fff';
    }

    let style = {};
    style[property] = value;
    return style;
  }

  getCurrentSlotNumber(): number {
    let capabilityValue = this.presetService.getCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.WheelSlot, undefined, this.wheelName, this._fixtureTemplate.uuid);
    if (capabilityValue) {
      return capabilityValue.slotNumber;
    }
    return undefined;
  }

  slotCapabilityIsSelected(slotNumber: number): boolean {
    let selectedSlotNumber = this.getCurrentSlotNumber();

    if (selectedSlotNumber >= 0) {
      // a slot is selected
      return selectedSlotNumber == slotNumber;
    } else {
      // no slot is selected and the capability is inactive
      // -> show the approx. color, if a color or a similar slot from a different wheel has been selected
      let approximatedCapability = this.presetService.getApproximatedColorWheelCapability(this.presetService.selectedPreset, this._channelName, this._fixtureTemplate);
      if (approximatedCapability) {
        return slotNumber == approximatedCapability.slotNumber;
      } else {
        return false;
      }
    }
  }

  changeActive(active: boolean) {
    if (active) {
      this.presetService.setCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.WheelSlot, undefined, 1, undefined, this.wheelName, this._fixtureTemplate.uuid);
    } else {
      this.presetService.deleteCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.WheelSlot, undefined, this.wheelName, this._fixtureTemplate.uuid);
    }
  }

  selectSlotNumber(slotNumber: number) {
    this.presetService.setCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.WheelSlot, undefined, slotNumber, undefined, this.wheelName, this._fixtureTemplate.uuid);
  }

}
