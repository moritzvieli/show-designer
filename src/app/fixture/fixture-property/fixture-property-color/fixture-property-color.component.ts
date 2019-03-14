import { Component, OnInit } from '@angular/core';
import { PresetService } from 'src/app/services/preset.service';
import { FixturePropertyValue } from 'src/app/models/fixture-property-value';
import { FixturePropertyType } from 'src/app/models/fixture-property';

declare var iro: any;

@Component({
  selector: 'app-fixture-property-color',
  templateUrl: './fixture-property-color.component.html',
  styleUrls: ['./fixture-property-color.component.css']
})
export class FixturePropertyColorComponent implements OnInit {

  color: string = '#fff';
  colorPicker: any;
  active: boolean = false;
  private colorPickerMounted: boolean = false;

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
    this.colorPicker.on("mount", this.mount.bind(this));
  }

  mount() {
    this.colorPickerMounted = true;
  }

  private updateFixtureColor(color: any) {
    if(this.presetService.selectedPreset) {
      if(color) {
        this.presetService.setPropertyValue(this.presetService.selectedPreset, FixturePropertyType.colorRed, color.rgb.r);
        this.presetService.setPropertyValue(this.presetService.selectedPreset, FixturePropertyType.colorGreen, color.rgb.g);
        this.presetService.setPropertyValue(this.presetService.selectedPreset, FixturePropertyType.colorBlue, color.rgb.b);
      } else {
        this.presetService.deletePropertyValue(this.presetService.selectedPreset, FixturePropertyType.colorRed);
        this.presetService.deletePropertyValue(this.presetService.selectedPreset, FixturePropertyType.colorGreen);
        this.presetService.deletePropertyValue(this.presetService.selectedPreset, FixturePropertyType.colorBlue);
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
    if(!this.colorPickerMounted) {
      return;
    }

    this.active = true;
    this.color = color.hexString;
    this.updateFixtureColor(color);
  }

}
