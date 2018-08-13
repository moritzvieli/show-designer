import { EffectMapping } from './models/effect-mapping';
import { WaveSine } from './models/wave-sine';
import { MovingHead, MovingHeadChannel } from './models/moving-head';
import { FixtureService } from './services/fixture.service';
import { Fixture } from './models/fixture';
import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import Split from 'split.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  fixtures: Fixture[] = [];

  @ViewChild(PreviewComponent)
  previewComponent:PreviewComponent;

  constructor (public fixtureService: FixtureService) {}

  private onResize() {
    if(this.previewComponent) {
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
    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 30, 20],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#preview'], {
      sizes: [30, 70],
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    Split(['#effects', '#fixtures'], {
      sizes: [80, 20],
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    this.onResize();

    let movingHead: MovingHead;

    let effect = new WaveSine();
    let effectMapping = new EffectMapping<MovingHeadChannel>();
    effectMapping.effect = effect;
    effectMapping.channels.push(MovingHeadChannel.colorR);

    let effectTilt = new WaveSine();
    effectTilt.amplitude = 6;
    effectTilt.lengthMillis = 3000;
    let effectMappingTilt = new EffectMapping<MovingHeadChannel>();
    effectMappingTilt.effect = effectTilt;
    effectMappingTilt.channels.push(MovingHeadChannel.tilt);

    movingHead = new MovingHead();
    movingHead.positionY = 30;
    movingHead.positionX = 0;
    movingHead.colorG = 255;
    movingHead.effects.push(effectMapping);
    movingHead.effects.push(effectMappingTilt);
    this.fixtureService.addFixture(movingHead);

    movingHead = new MovingHead();
    movingHead.positionY = 30;
    movingHead.positionX = 10;
    this.fixtureService.addFixture(movingHead);

    movingHead = new MovingHead();
    movingHead.positionY = 30;
    movingHead.positionX = 20;
    this.fixtureService.addFixture(movingHead);
  }

}
