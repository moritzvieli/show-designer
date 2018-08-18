import { EffectService } from './services/effect.service';
import { UuidService } from './services/uuid.service';
import { EffectMapping } from './models/effect-mapping';
import { CurveEffect } from './models/curve-effect';
import { MovingHead, MovingHeadChannel } from './models/moving-head';
import { FixtureService } from './services/fixture.service';
import { Fixture } from './models/fixture';
import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Effect } from './models/effect';

import Split from 'split.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'app';
  effects: Effect[] = [];

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
      sizes: [50, 30, 20],
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

    this.onResize();

    // let movingHead: MovingHead;

    // let effect = new CurveEffect(this.uuidService, this.fixtureService, this.effectService);
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

  addCurveEffect() {
    this.effects.push(new CurveEffect(this.uuidService, this.fixtureService, this.effectService));
  }

  addPanTiltEffect() {
    // TODO
  }

  openEffect(index: number, event: any) {
    console.log(index, event);
  }

  addMovingHead() {
    let movingHead = new MovingHead();
    movingHead.positionY = 30;
    movingHead.isSelected = true;

    this.fixtureService.addFixture(movingHead);
  }

  selectFixture(event, item: Fixture) {
    item.isSelected = !item.isSelected;
  }

}
