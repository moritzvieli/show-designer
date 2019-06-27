import { AnimationService } from './../../services/animation.service';
import { Subscription, timer } from 'rxjs';
import { EffectCurve } from './../../models/effect-curve';
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureService } from '../../services/fixture.service';
import { FixtureCapability, FixtureCapabilityType, FixtureCapabilityColor } from '../../models/fixture-capability';
import { FixtureTemplateChannels } from '../../models/fixture-template-channels';

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

  availableCapabilities: FixtureCapability[] = [];
  availableChannels: FixtureTemplateChannels[] = [];

  @Input() curve: EffectCurve;

  // whether the effect is currently being edited (open) or not
  @Input()
  set isSelected(value: boolean) {
    if (value) {
      // start the update timer
      if (!this.gridUpdateSubscription) {
        this.gridUpdateSubscription = timer(15, 0).subscribe(() => { this.redraw(); });
      }
    } else {
      // stop the update timer
      if (this.gridUpdateSubscription) {
        this.gridUpdateSubscription.unsubscribe();
        this.gridUpdateSubscription = undefined;
      }
    }
  }

  @ViewChild('curveGrid') curveGrid: ElementRef;

  constructor(
    private presetService: PresetService,
    private animationService: AnimationService,
    private fixtureService: FixtureService) {

    this.presetService.fixtureSelectionChanged.subscribe(() => {
      this.updateCapabilitiesAndChannels();
    });

    this.updateCapabilitiesAndChannels();
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

  private getPhasingCount(): number {
    let count: number = 0;
    let countedDmxChannels: number[] = [];

    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);

      if (!countedDmxChannels.includes(fixture.dmxFirstChannel)) {
        count++;
        countedDmxChannels.push(fixture.dmxFirstChannel);
      }
    }

    return count;
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight);
    this.ctx.fillStyle = "#fff";
    this.ctx.strokeStyle = "#fff";

    // the width of the lines
    let width: number = 3;

    this.ctx.lineWidth = width;

    let oldX: number;
    let oldY: number;

    let step = 50;
    let durationMillis = this.curve.lengthMillis * Math.round(4 - this.curve.lengthMillis / 1000);
    let maxValue = this.curve.maxValue;

    // draw the curve
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

    // draw the current value
    this.drawCurrentValue(this.animationService.timeMillis % durationMillis, 5, width, durationMillis, maxValue);

    // draw the phasing values (chase), if required
    let phasingCount = 0;

    if (this.curve.phasingMillis > 0 && this.presetService.selectedPreset) {
      phasingCount = this.getPhasingCount();
    }

    for (let i = 1; i < phasingCount; i++) {
      this.drawCurrentValue((this.animationService.timeMillis - i * this.curve.phasingMillis) % durationMillis, 3, width, durationMillis, maxValue);
    }
  }

  private updateCapabilitiesAndChannels() {
    this.availableCapabilities = [];

    if (this.presetService.hasCapabilityDimmer()) {
      let capability = new FixtureCapability();
      capability.type = FixtureCapabilityType.Intensity;
      this.availableCapabilities.push(capability);
    }

    if (this.presetService.hasCapabilityColor()) {
      let capability = new FixtureCapability();
      capability.type = FixtureCapabilityType.ColorIntensity;
      capability.color = FixtureCapabilityColor.Red;
      this.availableCapabilities.push(capability);

      capability = new FixtureCapability();
      capability.type = FixtureCapabilityType.ColorIntensity;
      capability.color = FixtureCapabilityColor.Green;
      this.availableCapabilities.push(capability);

      capability = new FixtureCapability();
      capability.type = FixtureCapabilityType.ColorIntensity;
      capability.color = FixtureCapabilityColor.Blue;
      this.availableCapabilities.push(capability);
    }

    if (this.presetService.hasCapabilityPanTilt()) {
      let capability = new FixtureCapability();
      capability.type = FixtureCapabilityType.Pan;
      this.availableCapabilities.push(capability);

      capability = new FixtureCapability();
      capability.type = FixtureCapabilityType.Tilt;
      this.availableCapabilities.push(capability);
    }

    this.availableChannels = [];
  }

  getCapabilityName(capability: FixtureCapability): string {
    let name: string = '';
    name += capability.type;
    if (capability.color) {
      name += ', ' + capability.color;
    }
    return name;
  }

  getChannelName(templateChannels: FixtureTemplateChannels, channelIndex: number): string {
    let template = this.fixtureService.getTemplateByUuid(templateChannels.templateUuid);
    return template.name += ' - ' + templateChannels.channels[channelIndex];
  }

  capabilityChecked(capability: FixtureCapability): boolean {
    for (let existingCapability of this.curve.capabilities) {
      if (this.fixtureService.capabilitiesMatch(
        existingCapability.type,
        capability.type,
        existingCapability.color,
        capability.color,
        null,
        null,
        null,
        null,
      )) {
        return true;
      }
    }
    return false;
  }

  toggleCapability(event: any, capability: FixtureCapability) {
    if (event.currentTarget.checked) {
      // add the capability
      this.curve.capabilities.push(capability);
    } else {
      // Remove the channel
      for (let i = 0; i < this.curve.capabilities.length; i++) {
        let existingCapability = this.curve.capabilities[i];
        if (this.fixtureService.capabilitiesMatch(
          existingCapability.type,
          capability.type,
          existingCapability.color,
          capability.color,
          null,
          null,
          null,
          null,
        )) {
          this.curve.capabilities.splice(i, 1);
        }
      }
    }
  }

  channelChecked(): boolean {
    // TODO
    return false;
  }

  toggleChannel(event: any, templateChannels: FixtureTemplateChannels, channelIndex: number) {
    // TODO
  }

}
