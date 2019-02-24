import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FixtureService } from 'src/app/services/fixture.service';
import { SceneService } from 'src/app/services/scene.service';

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
    private fixtureService: FixtureService,
    private sceneService: SceneService
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
    this.fixtureService.fixtures.forEach(fixture => {
      if (fixture.isSelected) {
        for (let sceneFixtureProperties of this.sceneService.getSelectedScenesFixtureProperties(fixture)) {
          let properties: any = sceneFixtureProperties.properties;
          
          if (color) {
            properties.colorR = color.rgb.r;
            properties.colorG = color.rgb.g;
            properties.colorB = color.rgb.b;
          } else {
            properties.colorR = undefined;
            properties.colorG = undefined;
            properties.colorB = undefined;
          }
        }
      }
    });
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
