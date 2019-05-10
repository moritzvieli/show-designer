import { AnimationService } from './../../services/animation.service';
import { Subscription, timer } from 'rxjs';
import { EffectCurve } from './../../models/effect-curve';
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { EffectChannel } from '../../models/effect';
import { PresetService } from '../../services/preset.service';

@Component({
  selector: 'app-effect-curve',
  templateUrl: './effect-curve.component.html',
  styleUrls: ['./effect-curve.component.css']
})
export class EffectCurveComponent implements OnInit {

  private gridUpdateSubscription: Subscription;
  private ctx: any;
  private maxWidth: number;
  private maxHeight: number;

  channels: Array<string>;

  @Input() curve: EffectCurve;

  // Whether the effect is currently being edited (open) or not
  @Input()
  set isSelected(value: boolean) {
    if (value) {
      // Start the update timer
      if (!this.gridUpdateSubscription) {
        this.gridUpdateSubscription = timer(15, 0).subscribe(() => { this.redraw(); });
      }
    } else {
      // Stop the update timer
      if (this.gridUpdateSubscription) {
        this.gridUpdateSubscription.unsubscribe();
        this.gridUpdateSubscription = undefined;
      }
    }
  }


  @ViewChild('curveGrid') curveGrid: ElementRef;

  constructor(
    private presetService: PresetService,
    private animationService: AnimationService) {

    //let channelEnum = EffectChannel;
    let keys = Object.keys(EffectChannel);
    this.channels = keys.slice(keys.length / 2)
  }

  ngOnInit() {
    let canvas = this.curveGrid.nativeElement;
    this.ctx = canvas.getContext("2d");
    this.maxWidth = canvas.width;
    this.maxHeight = canvas.height;

    this.redraw();
  }

  private drawCurrentValue(currMillis: number, radius: number, lineWidth: number, durationMillis: number, maxValue: number) {
    let currVal = this.curve.getValueAtMillis(currMillis);
    let x = this.maxWidth * (currMillis % durationMillis) / durationMillis;
    let y = this.maxHeight - ((this.maxHeight - lineWidth * 4) * currVal / maxValue + lineWidth * 2);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = '#fff';
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#000';
    this.ctx.stroke();
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#fff";

    // The width of the lines
    let width: number = 3;

    this.ctx.lineWidth = width;

    let oldX: number;
    let oldY: number;

    let step = 50;
    let durationMillis = this.curve.lengthMillis * Math.round(4 - this.curve.lengthMillis / 1000);
    let maxValue = this.curve.maxValue;

    // Draw the curve
    for (var i = -step * 2; i < durationMillis + step * 2; i += step) {
      let val = this.curve.getValueAtMillis(i);

      // Scale the values to the grid dimensions
      let x = this.maxWidth * i / durationMillis;
      let y = this.maxHeight - ((this.maxHeight - width * 4) * val / maxValue + width * 2);

      if (oldY) {
        this.ctx.beginPath();
        this.ctx.moveTo(oldX, oldY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
      }

      oldX = x;
      oldY = y;
    }

    // Draw the current value
    this.drawCurrentValue(this.animationService.timeMillis % durationMillis, 5, width, durationMillis, maxValue);

    // Draw the phasing values (chase), if required
    let phasingCount = 0;

    if (this.curve.phasingMillis > 0) {
      if(this.presetService.selectedPreset) {
        phasingCount = this.presetService.selectedPreset.fixtures.length;
      }
    }

    for (let i = 1; i < phasingCount; i++) {
      this.drawCurrentValue((this.animationService.timeMillis - i * this.curve.phasingMillis) % durationMillis, 3, width, durationMillis, maxValue);
    }
  }

  toggleChannel(event: any, channel: EffectChannel) {
    let enumChannel: any = Object.keys(EffectChannel).find(key => EffectChannel[key] === channel);

    if(event.currentTarget.checked) {
      // Add the channel
      this.curve.effectChannels.push(enumChannel);
    } else {
      // Remove the channel
      for(let i = 0; i < this.curve.effectChannels.length; i++) {
        if(this.curve.effectChannels[i] == enumChannel) {
          this.curve.effectChannels.splice(i, 1);
        }
      }
    }
  }

}
