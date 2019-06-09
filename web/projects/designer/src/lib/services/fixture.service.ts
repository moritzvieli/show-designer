import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FixtureChannel } from '../models/fixture-channel';
import { ProjectService } from './project.service';
import { Observable, forkJoin, of } from 'rxjs';
import { FixtureCapabilityType, FixtureCapability } from '../models/fixture-capability';
import { FixtureWheelSlot } from '../models/fixture-wheel-slot';
import { FixtureWheel } from '../models/fixture-wheel';
import { Color } from '../models/color';
import { CachedFixture } from '../models/cached-fixture';
import { CachedFixtureChannel } from '../models/cached-fixture-channel';
import { CachedFixtureCapability } from '../models/cached-fixture-capability';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

  cachedFixtures: CachedFixture[] = [];

  constructor(
    private http: HttpClient,
    private projectService: ProjectService
  ) { }

  getFixtureByUuid(uuid: string): Fixture {
    for (let fixture of this.projectService.project.fixtures) {
      if (fixture.uuid == uuid) {
        return fixture;
      }
    }
  }

  getCachedFixtureByUuid(uuid: string): CachedFixture {
    for (let fixture of this.cachedFixtures) {
      if (fixture.fixture.uuid == uuid) {
        return fixture;
      }
    }
  }

  // Get all templates to search for (only metadata)
  getSearchTemplates(): Observable<FixtureTemplate[]> {
    return this.http.get('fixture-search').pipe(map((response: Array<Object>) => {
      let searchTemplates: FixtureTemplate[] = [];

      for (let template of response) {
        searchTemplates.push(new FixtureTemplate(template));
      }

      return searchTemplates;
    }));
  }

  getTemplateByUuid(uuid: string): FixtureTemplate {
    for (let fixtureTemplate of this.projectService.project.fixtureTemplates) {
      if (fixtureTemplate.uuid == uuid) {
        return fixtureTemplate;
      }
    }
  }

  loadTemplateByUuid(uuid: string): Observable<void> {
    let loadedTemplate = this.getTemplateByUuid(uuid);

    if (loadedTemplate) {
      // This template is already loaded
      return of(undefined);
    }

    // Load the metadata and the template
    return forkJoin(
      this.http.get('fixture-search?uuid=' + encodeURI(uuid)),
      this.http.get('fixture?uuid=' + encodeURI(uuid))
    ).pipe(map(result => {
      let fixtureTemplate = new FixtureTemplate(result[0][0], result[1]);
      this.projectService.project.fixtureTemplates.push(fixtureTemplate);
    }));
  }

  getRotationAngleDeg(value: string): number {
    // convert a rotation angle value into degrees
    if (value.endsWith('deg')) {
      return Number.parseInt(value.replace('deg', ''));
    } else if (value.endsWith('%')) {
      let perc = Number.parseInt(value.replace('%', ''));
      return perc / 100 * 360;
    }

    return undefined;
  }

  getWheelSlotColors(wheel: FixtureWheel, slotNumber: number): string[] {
    let colors: string[] = [];
    let wheelSlots = this.getWheelSlots(wheel, slotNumber);

    for (let slot of wheelSlots) {
      if (slot.colors && slot.colors.length > 0) {
        colors = colors.concat(slot.colors);
      }
    }

    return colors;
  }

  getMixedWheelSlotColor(wheel: FixtureWheel, slotNumber: number): Color {
    let colors = this.getWheelSlotColors(wheel, slotNumber);
    let colorsRgb: Color[] = [];

    if (colors.length == 0) {
      return undefined;
    }

    for (let color of colors) {
      colorsRgb.push(this.hexToRgb(color));
    }

    return this.mixColors(colorsRgb);
  }

  private componentToHex(c: number): any {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  hexToRgb(hex: string): Color {
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Color(
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ) : null;
  }

  mixColors(colors: Color[]): Color {
    // mix an array of rgb-colors containing r, g, b values to a new color
    let r: number = 0;
    let g: number = 0;
    let b: number = 0;

    for (let color of colors) {
      r += color.red;
      g += color.green;
      b += color.blue;
    }

    r /= colors.length;
    g /= colors.length;
    b /= colors.length;

    return new Color(r, g, b);
  }

  getWheelByName(template: FixtureTemplate, wheelName: string): FixtureWheel {
    for (let property in template.wheels) {
      if (property == wheelName) {
        return template.wheels[property];
      }
    }

    // wheel not found
    return undefined;
  }

  private getWheelSlots(wheel: FixtureWheel, slotNumber: number): FixtureWheelSlot[] {
    // return one slot or two slots, if they are mixed (e.g. slor number 2.5 returns the slots 2 and 3)
    let slots: FixtureWheelSlot[] = [];

    if (!wheel) {
      return slots;
    }

    if (slotNumber - Math.floor(slotNumber) > 0) {
      // two slots are set
      let number = Math.floor(slotNumber);
      slots.push(wheel.slots[number - 1]);
      if (wheel.slots[number]) {
        slots.push(wheel.slots[number]);
      }
    } else {
      // only one slot is set
      slots.push(wheel.slots[slotNumber - 1]);
    }

    return slots;
  }

  getModeByFixture(template: FixtureTemplate, fixture: Fixture): FixtureMode {
    for (let mode of template.modes) {
      if (mode.shortName) {
        if (mode.shortName === fixture.modeShortName) {
          return mode;
        }
      } else {
        if (mode.name == fixture.modeShortName) {
          return mode;
        }
      }
    }
  }

  private getFixtureCapability(capability: FixtureCapability, channelName: string, template: FixtureTemplate): CachedFixtureCapability {
    let cachedFixtureCapability = new CachedFixtureCapability();
    cachedFixtureCapability.capability = capability;
    if(capability.slotNumber) {
      // there is a wheel connected to this capability
      cachedFixtureCapability.wheelName = capability.wheel || channelName;
      cachedFixtureCapability.wheel = this.getWheelByName(template, cachedFixtureCapability.wheelName);
      cachedFixtureCapability.wheelSlots = this.getWheelSlots(cachedFixtureCapability.wheel, capability.slotNumber);
      for (let slot of cachedFixtureCapability.wheelSlots) {
        if (slot.colors.length > 0) {
          cachedFixtureCapability.wheelIsColor = true;
          break;
        }
      }
    }
    cachedFixtureCapability.centerValue = Math.floor((cachedFixtureCapability.capability.dmxRange[0] + cachedFixtureCapability.capability.dmxRange[1]) / 2);
    return cachedFixtureCapability;
  }

  private getCapabilitiesByChannel(fixtureChannel: FixtureChannel, channelName: string, template: FixtureTemplate): CachedFixtureCapability[] {
    let capabilites: CachedFixtureCapability[] = [];

    if (fixtureChannel.capability) {
      capabilites.push(this.getFixtureCapability(fixtureChannel.capability, channelName, template));
    } else if (fixtureChannel.capabilities) {
      for (let capability of fixtureChannel.capabilities) {
        capabilites.push(this.getFixtureCapability(capability, channelName, template));
      }
    }

    return capabilites;
  }

  private getMaxValueByChannel(fixtureChannel: FixtureChannel): number {
    return Math.pow(256, 1 + fixtureChannel.fineChannelAliases.length) - 1;
  }

  private getDefaultValueByChannel(fixtureChannel: FixtureChannel): number {
    if (!fixtureChannel.defaultValue) {
      return undefined;
    }

    if (isNaN(<any>fixtureChannel.defaultValue) && (<string>fixtureChannel.defaultValue).endsWith('%')) {
      // percentage value
      let percentage = Number.parseInt((<string>fixtureChannel.defaultValue).replace('%', ''));
      let maxValue = this.getMaxValueByChannel(fixtureChannel);
      return maxValue / 100 * percentage;
    } else {
      // DMX value
      return Number.parseInt(<any>fixtureChannel.defaultValue);
    }
  }

  private getColorWheelByChannel(channel: CachedFixtureChannel, template: FixtureTemplate): FixtureWheel {
    for (let channelCapability of channel.capabilities) {
      if (channelCapability.capability.type == FixtureCapabilityType.WheelSlot) {
        for (let slot of channelCapability.wheelSlots) {
          if (slot.colors.length > 0) {
            return channelCapability.wheel;
          }
        }
      }
    }

    return undefined;
  }

  getCachedChannels(template: FixtureTemplate, mode: FixtureMode): CachedFixtureChannel[] {
    let channels: CachedFixtureChannel[] = [];

    if (!mode) {
      return channels;
    }

    for (let channel of mode.channels) {
      // Check for string channel. It can get creepy for matrix modes
      if (typeof channel == "string") {
        let modeChannel: string = <string>channel;

        for (let availableChannelName in template.availableChannels) {
          let availableChannel: FixtureChannel = template.availableChannels[availableChannelName];

          if (modeChannel == availableChannelName || availableChannel.fineChannelAliases.indexOf(modeChannel) > -1) {
            // count the fine channel values for this channel in the current mode
            let fineChannelCount = 0;
            for (let modeChannel of mode.channels) {
              if (availableChannel.fineChannelAliases.indexOf(modeChannel) > -1) {
                fineChannelCount++;
              }
            }

            let cachedFixtureChannel = new CachedFixtureChannel();
            cachedFixtureChannel.fixtureChannel = availableChannel;
            cachedFixtureChannel.channelName = availableChannelName;
            cachedFixtureChannel.fineValueCount = fineChannelCount;
            cachedFixtureChannel.fineIndex = availableChannel.fineChannelAliases.indexOf(modeChannel);
            cachedFixtureChannel.capabilities = this.getCapabilitiesByChannel(cachedFixtureChannel.fixtureChannel, availableChannelName, template);
            cachedFixtureChannel.defaultValue = this.getDefaultValueByChannel(cachedFixtureChannel.fixtureChannel);
            cachedFixtureChannel.maxValue = this.getMaxValueByChannel(cachedFixtureChannel.fixtureChannel);
            cachedFixtureChannel.colorWheel = this.getColorWheelByChannel(cachedFixtureChannel, template);

            channels.push(cachedFixtureChannel);
          }
        }
      } else {
        // null may be passed as a placeholder for an undefined channel
        channels.push(new CachedFixtureChannel());
      }
    }

    return channels;
  }

  updateCachedFixtures() {
    // calculate some frequently used values as a cache to save cpu time
    // afterwards
    this.cachedFixtures = [];

    for (let i = 0; i < this.projectService.project.fixtures.length; i++) {
      let fixture = this.projectService.project.fixtures[i];
      let cachedFixture = new CachedFixture();

      cachedFixture.fixture = fixture;
      cachedFixture.template = this.getTemplateByUuid(fixture.fixtureTemplateUuid);
      cachedFixture.mode = this.getModeByFixture(cachedFixture.template, fixture);
      cachedFixture.channels = this.getCachedChannels(cachedFixture.template, cachedFixture.mode);

      this.cachedFixtures.push(cachedFixture);
    }
  }

}
