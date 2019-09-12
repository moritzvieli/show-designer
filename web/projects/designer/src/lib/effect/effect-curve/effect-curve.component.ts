import { AnimationService } from './../../services/animation.service';
import { Subscription, timer, Observable } from 'rxjs';
import { EffectCurve } from './../../models/effect-curve';
import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureService } from '../../services/fixture.service';
import { FixtureCapability, FixtureCapabilityType, FixtureCapabilityColor } from '../../models/fixture-capability';
import { EffectCurveProfileChannels } from '../../models/effect-curve-profile-channel';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { FixtureProfile } from '../../models/fixture-profile';
import { CachedFixtureChannel } from '../../models/cached-fixture-channel';

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

  public lengthMillisMin: number = 50;
  public lengthMillisMax: number = 2500;
  public amplitudeMin: number = 0;
  public amplitudeMax: number = 4;
  public percentageMin: number = 0;
  public percentageMax: number = 1;
  public phaseMillisMin: number = -1000;
  public phaseMillisMax: number = 1000;
  public phasingMillisMin: number = 0;
  public phasingMillisMax: number = 1000;

  // the selected capabilities
  public availableCapabilities: FixtureCapability[] = [];

  // the selected channels
  public availableChannels: Map<FixtureProfile, CachedFixtureChannel[]> = new Map<FixtureProfile, CachedFixtureChannel[]>();
  public availableProfiles: FixtureProfile[] = [];
  public selectedProfiles: FixtureProfile[] = [];

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
    private fixtureService: FixtureService,
    private translate: TranslateService) {

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

  private drawCurrentValue(currMillis: number, radius: number, lineWidth: number, durationMillis: number, maxHeight: number) {
    let currVal = 1 - this.curve.getValueAtMillis(currMillis);

    let x = this.maxWidth * (currMillis % durationMillis) / durationMillis;
    let y = maxHeight * currVal + lineWidth;

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

    if (length < 500) {
      step = 5;
    }

    let durationMillis = this.curve.lengthMillis * Math.round(4 - this.curve.lengthMillis / 1000);
    let maxHeight = this.maxHeight - width * 2;

    // draw the curve
    for (var i = -step * 2; i < durationMillis + step * 2; i += step) {
      let val = 1 - this.curve.getValueAtMillis(i);

      // Scale the values to the grid dimensions
      let x = this.maxWidth * i / durationMillis;
      let y = maxHeight * val + width;

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
    this.drawCurrentValue(this.animationService.timeMillis % durationMillis, 5, width, durationMillis, maxHeight);

    // draw the phasing values (chase), if required
    let phasingCount = 0;

    if (this.curve.phasingMillis > 0 && this.presetService.selectedPreset) {
      phasingCount = this.getPhasingCount();
    }

    for (let i = 1; i < phasingCount; i++) {
      this.drawCurrentValue((this.animationService.timeMillis - i * this.curve.phasingMillis) % durationMillis, 3, width, durationMillis, maxHeight);
    }
  }

  private calculateChannelCapabilities() {
    this.availableChannels = this.presetService.getSelectedProfileChannels(this.selectedProfiles);
  }

  changeProfileSelection($event: any, profile: FixtureProfile) {
    if (this.selectedProfiles.indexOf(profile) >= 0) {
      this.selectedProfiles.splice(this.selectedProfiles.indexOf(profile), 1);
    } else {
      this.selectedProfiles.push(profile);
    }

    this.calculateChannelCapabilities();
  }

  private updateCapabilitiesAndChannels() {
    // capabilities
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

    // calculate all profiles
    this.availableProfiles = this.presetService.getSelectedProfiles();

    // select all profiles by default
    this.selectedProfiles = [...this.availableProfiles];

    // calculate all channels
    this.calculateChannelCapabilities();
  }

  getCapabilityName(capability: FixtureCapability): Observable<string> {
    return this.translate.get([
      'designer.fixtureCapabilityType.' + capability.type,
      'designer.fixtureCapabilityColor.' + capability.color
    ]).pipe(map((result: string) => {
      let name: string = '';
      name += result['designer.fixtureCapabilityType.' + capability.type];

      if (capability.color) {
        name += ', ' + result['designer.fixtureCapabilityColor.' + capability.color];
      } else {
        return name;
      }

      return name;
    }));
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

    this.presetService.previewLive();
  }

  getChannelName(profileName: string, channelName: string) {
    if (this.availableProfiles.length > 1) {
      return profileName + ' - ' + channelName;
    }

    return channelName;
  }

  channelChecked(profile: FixtureProfile, channel: CachedFixtureChannel): boolean {
    for (let profileChannels of this.curve.channels) {
      if (profileChannels.profileUuid == profile.uuid) {
        if (profileChannels.channels.includes(channel.name)) {
          return true;
        }

        break;
      }
    }

    return false;
  }

  toggleChannel(event: any, profile: FixtureProfile, channel: CachedFixtureChannel) {
    // add the profile, if necessary
    let profileContained: boolean = false;
    for (let profileChannels of this.curve.channels) {
      if (profileChannels.profileUuid == profile.uuid) {
        profileContained = true;
        break;
      }
    }

    if (!profileContained) {
      let profileChannels = new EffectCurveProfileChannels();
      profileChannels.profileUuid = profile.uuid;
      this.curve.channels.push(profileChannels);
    }

    // add or delete the channel
    for (let profileChannels of this.curve.channels) {
      if (profileChannels.profileUuid == profile.uuid) {
        let index = profileChannels.channels.indexOf(channel.name);

        if (index >= 0) {
          profileChannels.channels.splice(index, 1);
        } else {
          profileChannels.channels.push(channel.name);
        }

        break;
      }
    }

    this.presetService.previewLive();
  }

  setLengthMillis(value: any) {
    if (!isNaN(value) && value >= this.lengthMillisMin && value <= this.lengthMillisMax) {
      this.curve.lengthMillis = +value;
      this.presetService.previewLive();
    }
  }

  setAmplitude(value: any) {
    if (!isNaN(value) && value >= this.amplitudeMin && value <= this.amplitudeMax) {
      this.curve.amplitude = +value;
      this.presetService.previewLive();
      console.log('aaa');
    }
  }

  setPosition(value: any) {
    if (!isNaN(value) && value >= this.percentageMin && value <= this.percentageMax) {
      this.curve.position = +value;
      this.presetService.previewLive();
    }
  }

  setPhaseMillis(value: any) {
    if (!isNaN(value) && value >= this.phaseMillisMin && value <= this.phaseMillisMax) {
      this.curve.phaseMillis = +value;
      this.presetService.previewLive();
    }
  }

  setPhasingMillis(value: any) {
    if (!isNaN(value) && value >= this.phasingMillisMin && value <= this.phasingMillisMax) {
      this.curve.phasingMillis = +value;
      this.presetService.previewLive();
    }
  }

}
