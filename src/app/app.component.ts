import { UuidService } from './services/uuid.service';
import { EffectCurve } from './models/effect-curve';
import { MovingHead } from './models/moving-head';
import { FixtureService } from './services/fixture.service';
import { Fixture } from './models/fixture';
import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Effect } from './models/effect';

import Split from 'split.js';
import { EffectPanTilt } from './models/effect-pan-tilt';
import { SceneService } from './services/scene.service';
import { SceneFixtureSettings } from './models/scene-fixture-settings';
import WaveSurfer from 'wavesurfer.js';
import CursorPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import { TranslateService } from '@ngx-translate/core';

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

  @ViewChild('waveWrapper')
  waveWrapper: ElementRef;

  constructor(
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    private sceneService: SceneService,
    private translateService: TranslateService) {

    this.translateService.use('en');
  }

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

    this.addMovingHead();
    this.addMovingHead();
    this.addMovingHead();
  }

  changeColor(color: any) {
    this.color = color.hexString;

    this.fixtureService.fixtures.forEach(fixture => {
      if (fixture.isSelected) {
        for (let sceneFixtureSettings of this.sceneService.getCurrentScene().sceneFixtureSettingsList) {
          if (sceneFixtureSettings.fixture.uuid == fixture.uuid) {
            let settings: any = sceneFixtureSettings.settings;
            settings.colorR = color.rgb.r;
            settings.colorG = color.rgb.g;
            settings.colorB = color.rgb.b;
          }
        }
      }
    });
  }

  addCurveEffect() {
    let effect = new EffectCurve(this.uuidService, this.fixtureService);
    this.selectedEffect = effect;
    this.sceneService.getCurrentScene().effects.push(effect);
  }

  addPanTiltEffect() {
    let effect = new EffectPanTilt(this.uuidService, this.fixtureService);
    this.selectedEffect = effect;
    this.sceneService.getCurrentScene().effects.push(effect);
  }

  openEffect(effect: Effect, event: any) {
    // Select all fixtures with this effect and unselect all other
    if (event) {
      this.fixtureService.fixtures.forEach(fixture => {
        let effectSelected = false;

        for (let effectFixture of effect.fixtures) {
          if (effectFixture.uuid == fixture.uuid) {
            effectSelected = true;
          }
        }

        if (effectSelected) {
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

  createDynamicClass<T>(Clazz: { new(): T }) {
    return new Clazz();
  }

  private addSceneFixtureSettings(fixture: Fixture) {
    // Add the base settings for this new fixture to all scenes
    for (let scene of this.sceneService.scenes) {
      let sceneFixtureSettings = new SceneFixtureSettings();
      sceneFixtureSettings.fixture = fixture;
      // Create a new instance of fixture
      sceneFixtureSettings.settings = new (fixture.constructor as any);
      scene.sceneFixtureSettingsList.push(sceneFixtureSettings);
    }
  }

  addMovingHead() {
    let movingHead = new MovingHead(this.uuidService);
    movingHead.positionY = 30;
    movingHead.isSelected = true;

    if (this.selectedEffect) {
      this.selectedEffect.fixtures.push(movingHead);
    }

    this.fixtureService.addFixture(movingHead);
    this.addSceneFixtureSettings(movingHead);
  }

  selectFixture(event, item: Fixture) {
    if (item.isSelected) {
      // Delete current effect
      if (this.selectedEffect) {
        for (var i = 0; i < this.selectedEffect.fixtures.length; i++) {
          if (this.selectedEffect.fixtures[i].uuid == item.uuid) {
            this.selectedEffect.fixtures.splice(i, 1);
            break;
          }
        }
      }
    } else {
      // Add current effect
      if (this.selectedEffect) {
        this.selectedEffect.fixtures.push(item);
      }
    }

    item.isSelected = !item.isSelected;
  }

  play() {
    var wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'white',
        progressColor: 'gray',
        height: 1,
        plugins: [
          CursorPlugin.create({
              showTime: true,
              opacity: 1,
              customShowTimeStyle: {
                  'background-color': '#000',
                  color: '#fff',
                  padding: '2px',
                  'font-size': '10px'
              }
          }),
          RegionsPlugin.create({})
      ]
    });
    wavesurfer.setHeight(this.waveWrapper.nativeElement.clientHeight);
    wavesurfer.load('../../assets/test.mp3');

    wavesurfer.zoom(130);

    // let audio = new Audio();
    // audio.src = "../../assets/test.mp3";
    // audio.load();
    // audio.play();
    // audio.volume = 0.1;
    // audio.currentTime = 12;
    // console.log(audio.currentTime);
    // setTimeout(() => {
    //   console.log(audio.currentTime);
    // }, 5500);
  }

}
