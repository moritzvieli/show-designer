import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { FixtureProfile } from '../models/fixture-profile';
import { FixtureMode } from '../models/fixture-mode';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FixtureChannel } from '../models/fixture-channel';
import { ProjectService } from './project.service';
import { Observable, forkJoin, of } from 'rxjs';
import { FixtureCapabilityType, FixtureCapability, FixtureCapabilityColor } from '../models/fixture-capability';
import { FixtureWheelSlot, FixtureWheelSlotType } from '../models/fixture-wheel-slot';
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

  // Get all profiles to search for (only metadata)
  getSearchProfiles(): Observable<FixtureProfile[]> {
    return this.http.get('fixtures').pipe(map((response: Array<Object>) => {
      let searchProfiles: FixtureProfile[] = [];

      for (let profile of response) {
        searchProfiles.push(new FixtureProfile(profile));
      }

      return searchProfiles;
    }));
  }

  getProfileByUuid(uuid: string): FixtureProfile {
    for (let FixtureProfile of this.projectService.project.fixtureProfiles) {
      if (FixtureProfile.uuid == uuid) {
        return FixtureProfile;
      }
    }
  }

  loadProfileByUuid(uuid: string): Observable<void> {
    let loadedProfile = this.getProfileByUuid(uuid);

    if (loadedProfile) {
      // This profile is already loaded
      return of(undefined);
    }

    // Load the metadata and the profile
    return forkJoin(
      this.http.get('fixtures?uuid=' + encodeURI(uuid)),
      this.http.get('fixture?uuid=' + encodeURI(uuid))
    ).pipe(map(result => {
      let mergedData = { ...result[0][0], ...result[1] }
      let fixtureProfile = new FixtureProfile(mergedData);
      this.projectService.project.fixtureProfiles.push(fixtureProfile);
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

  wheelHasSlotType(wheel: FixtureWheel, slotType: FixtureWheelSlotType): boolean {
    for (let slot of wheel.slots) {
      if (slot.type == slotType) {
        return true;
      }
    }

    return false;
  }

  getWheelByName(profile: FixtureProfile, wheelName: string): FixtureWheel {
    for (let property in profile.wheels) {
      if (property == wheelName) {
        return profile.wheels[property];
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
      if (number >= 0 && number < wheel.slots.length) {
        slots.push(wheel.slots[number]);
      }
    } else {
      // only one slot is set
      slots.push(wheel.slots[slotNumber - 1]);
    }

    return slots;
  }

  getModeByFixture(profile: FixtureProfile, fixture: Fixture): FixtureMode {
    for (let mode of profile.modes) {
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

  private getFixtureCapability(capability: FixtureCapability, channelName: string, profile: FixtureProfile): CachedFixtureCapability {
    let cachedFixtureCapability = new CachedFixtureCapability();
    cachedFixtureCapability.capability = capability;
    if (capability.slotNumber) {
      // there is a wheel connected to this capability
      if (typeof capability.wheel == "string") {
        cachedFixtureCapability.wheelName = <string>capability.wheel;
      } else if (Array.isArray(capability.wheel)) {
        cachedFixtureCapability.wheelName = capability.wheel[0];
      } else {
        cachedFixtureCapability.wheelName = channelName;
      }
      cachedFixtureCapability.wheel = this.getWheelByName(profile, cachedFixtureCapability.wheelName);
      cachedFixtureCapability.wheelSlots = this.getWheelSlots(cachedFixtureCapability.wheel, capability.slotNumber);
      cachedFixtureCapability.wheelIsColor = this.wheelHasSlotType(cachedFixtureCapability.wheel, FixtureWheelSlotType.Color);
    }
    if (cachedFixtureCapability.capability.dmxRange && cachedFixtureCapability.capability.dmxRange.length == 2) {
      cachedFixtureCapability.centerValue = Math.floor((cachedFixtureCapability.capability.dmxRange[0] + cachedFixtureCapability.capability.dmxRange[1]) / 2);
    }
    return cachedFixtureCapability;
  }

  private getCapabilitiesByChannel(fixtureChannel: FixtureChannel, channelName: string, profile: FixtureProfile): CachedFixtureCapability[] {
    let capabilites: CachedFixtureCapability[] = [];

    if (fixtureChannel.capability) {
      capabilites.push(this.getFixtureCapability(fixtureChannel.capability, channelName, profile));
    } else if (fixtureChannel.capabilities) {
      for (let capability of fixtureChannel.capabilities) {
        capabilites.push(this.getFixtureCapability(capability, channelName, profile));
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

  private getColorWheelByChannel(channel: CachedFixtureChannel, profile: FixtureProfile): FixtureWheel {
    for (let channelCapability of channel.capabilities) {
      if (channelCapability.wheelIsColor) {
        return channelCapability.wheel;
      }
    }

    return undefined;
  }

  // private channelInList(channels: CachedFixtureChannel[], name: string): boolean {
  //   for (let channel of channels) {
  //     if (channel.channelName == name) {
  //       return true;
  //     }
  //   }

  //   return false;
  // }

  getChannelByName(fixture: CachedFixture, channelName: string): CachedFixtureChannel {
    for (let channel of fixture.channels) {
      if ((channel.name && channel.name == channelName) || (channel.channel && channel.channel.fineChannelAliases.indexOf(channelName) > -1)) {
        return channel;
      }
    }

    return undefined;
  }

  getCachedChannels(profile: FixtureProfile, mode: FixtureMode): CachedFixtureChannel[] {
    let channels: CachedFixtureChannel[] = [];

    if (!mode) {
      return channels;
    }

    for (let availableChannelName in profile.availableChannels) {
      let availableChannel: FixtureChannel = profile.availableChannels[availableChannelName];

      for (let channel of mode.channels) {
        // check for string channel. It can get creepy for matrix modes
        if (typeof channel == "string") {
          let modeChannel: string = <string>channel;

          // don't check the fine channels. only add the coarse channel.
          if (modeChannel == availableChannelName) {
            let cachedFixtureChannel = new CachedFixtureChannel();
            cachedFixtureChannel.channel = availableChannel;
            cachedFixtureChannel.name = availableChannelName;
            cachedFixtureChannel.capabilities = this.getCapabilitiesByChannel(cachedFixtureChannel.channel, availableChannelName, profile);
            let defaultValue = this.getDefaultValueByChannel(cachedFixtureChannel.channel);
            if (defaultValue) {
              cachedFixtureChannel.defaultValue = defaultValue;
            }
            cachedFixtureChannel.maxValue = this.getMaxValueByChannel(cachedFixtureChannel.channel);
            cachedFixtureChannel.colorWheel = this.getColorWheelByChannel(cachedFixtureChannel, profile);
            channels.push(cachedFixtureChannel);
          }
        } else {
          // null may be passed as a placeholder for an undefined channel
          channels.push(new CachedFixtureChannel());
        }
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
      cachedFixture.profile = this.getProfileByUuid(fixture.profileUuid);
      cachedFixture.mode = this.getModeByFixture(cachedFixture.profile, fixture);
      cachedFixture.channels = this.getCachedChannels(cachedFixture.profile, cachedFixture.mode);

      this.cachedFixtures.push(cachedFixture);
    }
  }

  capabilitiesMatch(
    type1: FixtureCapabilityType,
    type2: FixtureCapabilityType,
    color1: FixtureCapabilityColor,
    color2: FixtureCapabilityColor,
    wheel1: string,
    wheel2: string,
    profileUuid1: string,
    profileUuid2: string
  ): boolean {
    // checks, whether two provided capapabilities match
    return type1 == type2
      && (!color1 || color1 == color2)
      && (!wheel1 || wheel1 == wheel2)
      && (!profileUuid1 || profileUuid1 == profileUuid2);
  }

}
