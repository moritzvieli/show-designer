import { EffectService } from './services/effect.service';
import { UuidService } from './services/uuid.service';
import { EffectCurve } from './models/effect-curve';
import { MovingHead } from './models/moving-head';
import { FixtureService } from './services/fixture.service';
import { Fixture } from './models/fixture';
import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Effect } from './models/effect';

import Split from 'split.js';

declare var iro: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  color: string;
  title = 'app';
  colorPicker: any;

  // The currently selected
  selectedEffect: Effect;

  @ViewChild(PreviewComponent)
  previewComponent: PreviewComponent;

  constructor(
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    private effectService: EffectService) { }

  private onResize() {
    if (this.previewComponent) {
      this.previewComponent.onResize();
    }
  }

  public changeSlider(evt) {
    this.previewComponent.updateSlider(evt.newValue);
  }

  public changePan(evt) {
    this.previewComponent.changePan(evt.newValue);
  }

  ngAfterViewInit(): void {
    let gutterSize: number = 12.8;

    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 31, 19],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#preview'], {
      sizes: [30, 70],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#effects', '#fixtures'], {
      sizes: [80, 20],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    this.colorPicker = new iro.ColorPicker("#color-picker-container", {
      width: 180,
      color: "#fff",
      borderWidth: 1,
      borderColor: "#fff",
      sliderMargin: 20
    });

    this.colorPicker.on("color:change", this.changeColor.bind(this));

    this.onResize();

    this.addCurveEffect();

    // let movingHead: MovingHead;

    // let effect = new CurveEffect(this.uuidService, this.fixtureService, this.effectService);
    // this.effects.push(effect);

    // let effectMapping = new EffectMapping<MovingHeadChannel>();
    // effectMapping.effect = effect;
    // effectMapping.channels.push(MovingHeadChannel.colorR);

    // let effectTilt = new CurveEffect(this.uuidService, this.fixtureService, this.effectService);
    // effectTilt.lengthMillis = 3000;
    // effectTilt.phasingMillis = 200;
    // effectTilt.amplitude = 100;
    // //effectTilt.position = 100;

    // let effectMappingTilt = new EffectMapping<MovingHeadChannel>();
    // effectMappingTilt.effect = effectTilt;
    // effectMappingTilt.channels.push(MovingHeadChannel.tilt);

    // let effectPan = new CurveEffect(this.uuidService, this.fixtureService, this.effectService);
    // effectPan.lengthMillis = 6000;
    // effectPan.phasingMillis = 200;
    // effectPan.amplitude = 100;

    // let effectMappingPan = new EffectMapping<MovingHeadChannel>();
    // effectMappingPan.effect = effectPan;
    // effectTilt.lengthMillis = 2000;
    // effectMappingPan.channels.push(MovingHeadChannel.pan);

    // for (var i = 0; i < 10; i++) {
    //   movingHead = new MovingHead();
    //   movingHead.positionY = 30;
    //   movingHead.positionX = i * 5 - 30;
    //   movingHead.colorG = 255;
    //   movingHead.pan = 127;
    //   movingHead.tilt = 127;
    //   //movingHead.effects.push(effectMapping);
    //   movingHead.effectMappings.push(effectMappingTilt);
    //   movingHead.effectMappings.push(effectMappingPan);
    //   this.fixtureService.addFixture(movingHead);
    // }



  }

  changeColor(color: any) {
    this.color = color.hexString;

    this.fixtureService.fixtures.forEach(fixture => {
      if (fixture.isSelected) {
        if (fixture instanceof MovingHead) {
          fixture.colorR = color.rgb.r;
          fixture.colorG = color.rgb.g;
          fixture.colorB = color.rgb.b;
        }
      }
    });
  }

  addCurveEffect() {
    let curveEffect = new EffectCurve(this.uuidService, this.fixtureService, this.effectService);
    this.effectService.effects.push(curveEffect);
  }

  addPanTiltEffect() {
    // TODO
  }

  openEffect(effect: Effect, event: any) {
    // Select all fixtures with this effect and unselect all other
    if (event) {
      this.fixtureService.fixtures.forEach(fixture => {
        let effectSelected = false;

        for (var i = 0; i < fixture.effects.length; i++) {
          if (fixture.effects[i].uuid == effect.uuid) {
            effectSelected = true;
            break;
          }
        }

        if(effectSelected) {
          fixture.isSelected = true;
        } else {
          fixture.isSelected = false;
        }
      });

      this.selectedEffect = effect;
    } else {
      if (this.selectedEffect == effect) {
        this.selectedEffect = undefined;
      }
    }
  }

  addMovingHead() {
    let movingHead = new MovingHead();
    movingHead.positionY = 30;
    movingHead.isSelected = true;

    if (this.selectedEffect) {
      movingHead.effects.push(this.selectedEffect);
    }

    this.fixtureService.addFixture(movingHead);
  }

  selectFixture(event, item: Fixture) {
    if (item.isSelected) {
      // Delete current effect
      if (this.selectedEffect) {
        for (var i = 0; i < item.effects.length; i++) {
          if (item.effects[i].uuid == this.selectedEffect.uuid) {
            item.effects.splice(i, 1);
            break;
          }
        }
      }
    } else {
      // Add current effect
      if (this.selectedEffect) {
        item.effects.push(this.selectedEffect);
      }
    }

    item.isSelected = !item.isSelected;
  }

}
