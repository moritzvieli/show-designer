import { Component, OnInit } from '@angular/core';
import { PresetService } from '../../../services/preset.service';
import { FixtureCapabilityType, FixtureCapabilityColor } from '../../../models/fixture-capability';

declare var iro: any;

@Component({
  selector: 'app-fixture-capability-color',
  templateUrl: './fixture-capability-color.component.html',
  styleUrls: ['./fixture-capability-color.component.css']
})
export class FixtureCapabilityColorComponent implements OnInit {

  color: string = '#fff';
  colorPicker: any;
  active: boolean = false;
  // private colorPickerMounted: boolean = false;

  constructor(
    private presetService: PresetService
  ) { }

  ngOnInit() {
    this.colorPicker = new iro.ColorPicker("#color-picker-container", {
      width: 180,
      color: this.color,
      borderWidth: 1,
      borderColor: "#fff",
      sliderMargin: 20
    });

    this.colorPicker.on("color:change", this.changeColor.bind(this));
    // Mount already fired before this method is called
    // this.colorPicker.on("mount", this.mount.bind(this));
  }

  // mount() {
  //   this.colorPickerMounted = true;
  // }

  private updateFixtureColor(color: any) {
    if(this.presetService.selectedPreset) {
      if(color) {
        this.presetService.setCapabilityValue(FixtureCapabilityType.ColorIntensity, color.rgb.r, { color: FixtureCapabilityColor.Red });
        this.presetService.setCapabilityValue(FixtureCapabilityType.ColorIntensity, color.rgb.g, { color: FixtureCapabilityColor.Green });
        this.presetService.setCapabilityValue(FixtureCapabilityType.ColorIntensity, color.rgb.b, { color: FixtureCapabilityColor.Blue });
      } else {
        this.presetService.deleteCapabilityValue(FixtureCapabilityType.ColorIntensity, { color: FixtureCapabilityColor.Red });
        this.presetService.deleteCapabilityValue(FixtureCapabilityType.ColorIntensity, { color: FixtureCapabilityColor.Green });
        this.presetService.deleteCapabilityValue(FixtureCapabilityType.ColorIntensity, { color: FixtureCapabilityColor.Blue });
      }
    }
  }

  changeActive(active: boolean) {
    this.active = active;

    if (active) {
      this.updateFixtureColor(this.colorPicker.color);
    } else {
      this.updateFixtureColor(undefined);
    }
  }

  changeColor(color: any) {
    // if(!this.colorPickerMounted) {
    //   return;
    // }

    this.active = true;
    this.color = color.hexString;
    this.updateFixtureColor(color);
  }

}
