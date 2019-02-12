import { Component, OnInit } from '@angular/core';
import { FixtureService } from 'src/app/services/fixture.service';
import { SceneService } from 'src/app/services/scene.service';

declare var iro: any;

@Component({
  selector: 'app-fixture-property-color',
  templateUrl: './fixture-property-color.component.html',
  styleUrls: ['./fixture-property-color.component.css']
})
export class FixturePropertyColorComponent implements OnInit {

  color: string;
  colorPicker: any;

  constructor(
    private fixtureService: FixtureService,
    private sceneService: SceneService
    ) { }

  ngOnInit() {
    this.colorPicker = new iro.ColorPicker("#color-picker-container", {
      width: 180,
      color: "#fff",
      borderWidth: 1,
      borderColor: "#fff",
      sliderMargin: 20
    });

    this.colorPicker.on("color:change", this.changeColor.bind(this));
  }

  changeColor(color: any) {
    this.color = color.hexString;

    this.fixtureService.fixtures.forEach(fixture => {
      if (fixture.isSelected) {
        for(let sceneFixtureProperties of this.sceneService.getSelectedScenesFixtureProperties(fixture)) {
          let properties: any = sceneFixtureProperties.properties;
          properties.colorR = color.rgb.r;
          properties.colorG = color.rgb.g;
          properties.colorB = color.rgb.b;
        }
      }
    });
  }

}
