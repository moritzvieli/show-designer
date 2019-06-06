import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FixtureChannel } from '../models/fixture-channel';
import { ProjectService } from './project.service';
import { Observable, forkJoin, of } from 'rxjs';
import { FixtureChannelFineIndex } from '../models/fixture-channel-fine-index';
import { FixtureCapabilityType, FixtureCapability } from '../models/fixture-capability';
import { FixtureWheelSlot } from '../models/fixture-wheel-slot';
import { FixtureWheel } from '../models/fixture-wheel';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

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

  getTemplateByFixture(fixture: Fixture): FixtureTemplate {
    return this.getTemplateByUuid(fixture.fixtureTemplateUuid);
  }

  getModeByFixture(fixture: Fixture): FixtureMode {
    let template = this.getTemplateByFixture(fixture);

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

  getChannelsByTemplateMode(template: FixtureTemplate, mode: FixtureMode): FixtureChannelFineIndex[] {
    let channels: FixtureChannelFineIndex[] = [];

    for (let channel of mode.channels) {
      // Check for string channel. It can get creepy for matrix modes
      if (typeof channel == "string") {
        let modeChannel: string = <string>channel;

        for (let availableChannelName in template.availableChannels) {
          let availableChannel: FixtureChannel = template.availableChannels[availableChannelName];

          if (modeChannel == availableChannelName || availableChannel.fineChannelAliases.indexOf(modeChannel) > -1) {
            // count the fine channel values for this channel in the current mode
            let fineChannels = 0;
            for (let modeChannel of mode.channels) {
              if (availableChannel.fineChannelAliases.indexOf(modeChannel) > -1) {
                fineChannels++;
              }
            }

            channels.push(new FixtureChannelFineIndex(availableChannel, template, availableChannelName, fineChannels, availableChannel.fineChannelAliases.indexOf(modeChannel)));
          }
        }
      } else {
        // null may be passed as a placeholder for an undefined channel
        channels.push(new FixtureChannelFineIndex(undefined, template));
      }
    }

    return channels;
  }

  getChannelsByFixture(fixture: Fixture): FixtureChannelFineIndex[] {
    let template = this.getTemplateByFixture(fixture);
    let mode = this.getModeByFixture(fixture);

    if (!mode) {
      return [];
    }

    return this.getChannelsByTemplateMode(template, mode);
  }

  getChannelByName(channelName: string, fixture: Fixture): FixtureChannelFineIndex {
    let channels = this.getChannelsByFixture(fixture);

    for (let channel of channels) {
      if (channel.channelName == channelName) {
        return channel;
      }
    }

    return null;
  }

  getCapabilitiesByChannel(fixtureChannel: FixtureChannel): FixtureCapability[] {
    let capabilites: FixtureCapability[] = [];

    if (fixtureChannel.capability) {
      capabilites.push(fixtureChannel.capability);
    } else if (fixtureChannel.capabilities) {
      capabilites = Object.assign([], fixtureChannel.capabilities);
    }

    return capabilites;
  }

  getCapabilitiesByChannelName(channelName: string, templateUuid: string): FixtureCapability[] {
    let template = this.getTemplateByUuid(templateUuid);

    for (let property in template.availableChannels) {
      if (property == channelName) {
        return this.getCapabilitiesByChannel(template.availableChannels[property]);
      }
    }

    return [];
  }

  getCapabilityInValue(channelName: string, templateUuid: string, value: number): FixtureCapability {
    let capabilities = this.getCapabilitiesByChannelName(channelName, templateUuid);
    for (let capability of capabilities) {
      if (capability.dmxRange.length == 0 || (value >= capability.dmxRange[0] && value <= capability.dmxRange[1])) {
        return capability;
      }
    }

    return null;
  }

  channelHasCapabilityType(fixtureChannel: FixtureChannel, fixtureCapabilityType: FixtureCapabilityType): boolean {
    let capabilites: FixtureCapability[] = this.getCapabilitiesByChannel(fixtureChannel);

    for (let capability of capabilites) {
      if (capability.type == fixtureCapabilityType) {
        return true;
      }
    }

    return false;
  }

  getMaxValueByChannel(fixtureChannel: FixtureChannel): number {
    return Math.pow(256, 1 + fixtureChannel.fineChannelAliases.length) - 1;
  }

  getDefaultValueByChannel(fixtureChannel: FixtureChannel): number {
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

  getWheelByName(template: FixtureTemplate, wheelName: string): FixtureWheel {
    for (let property in template.wheels) {
      if (property == wheelName) {
        return template.wheels[property];
      }
    }

    // wheel not found
    return undefined;
  }

  getWheelSlots(template: FixtureTemplate, wheelName: string, slotNumber: number): FixtureWheelSlot[] {
    // return one slot or two slots, if they are mixed (e.g. slor number 2.5 returns the slots 2 and 3)
    let wheel = this.getWheelByName(template, wheelName);

    if(!wheel) {
      return undefined;
    }

    if (slotNumber - Math.floor(slotNumber) > 0) {
      // two slots are set
      let slots: FixtureWheelSlot[] = [];
      let number = Math.floor(slotNumber);
      slots.push(wheel.slots[number - 1]);
      if (wheel.slots[number]) {
        slots.push(wheel.slots[number]);
      }
      return slots;
    } else {
      // only one slot is set
      return [wheel.slots[slotNumber - 1]];
    }
  }

  private componentToHex(c: number): any {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  hexToRgb(hex: string): any {
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  mixColors(colors: any[]): any {
    // mix an array of rgb-colors containing r, g, b values to a new color
    let r: number = 0;
    let g: number = 0;
    let b: number = 0;

    for (let color of colors) {
      r += color.r;
      g += color.g;
      b += color.b;
    }

    r /= colors.length;
    g /= colors.length;
    b /= colors.length;

    return { r: r, g: g, b: b };
  }

}
