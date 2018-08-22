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
import { EffectPanTilt } from './models/effect-pan-tilt';

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

    this.addPanTiltEffect();

    this.onResize();
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
    let effect = new EffectCurve(this.uuidService, this.fixtureService, this.effectService);
    this.selectedEffect = effect;
    this.effectService.effects.push(effect);
  }

  addPanTiltEffect() {
    let effect = new EffectPanTilt(this.uuidService, this.fixtureService, this.effectService);
    this.selectedEffect = effect;
    this.effectService.effects.push(effect);
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
