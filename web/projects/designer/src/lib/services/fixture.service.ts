import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CachedFixture } from '../models/cached-fixture';
import { CachedFixtureCapability } from '../models/cached-fixture-capability';
import { CachedFixtureChannel } from '../models/cached-fixture-channel';
import { Color } from '../models/color';
import { Fixture } from '../models/fixture';
import { FixtureCapability, FixtureCapabilityColor, FixtureCapabilityType } from '../models/fixture-capability';
import { FixtureChannel } from '../models/fixture-channel';
import { FixtureMode } from '../models/fixture-mode';
import { FixtureProfile } from '../models/fixture-profile';
import { FixtureWheel } from '../models/fixture-wheel';
import { FixtureWheelSlot, FixtureWheelSlotType } from '../models/fixture-wheel-slot';
import { ProjectService } from './project.service';

@Injectable({
  providedIn: 'root',
})
export class FixtureService {
  cachedFixtures: CachedFixture[] = [];

  // is the side-tab settings currently selected?
  settingsSelection = false;

  selectedSettingsFixtures: Fixture[] = [];

  constructor(private http: HttpClient, private projectService: ProjectService) {}

  getFixtureByUuid(uuid: string): Fixture {
    for (const fixture of this.projectService.project.fixtures) {
      if (fixture.uuid === uuid) {
        return fixture;
      }
    }
  }

  getCachedFixtureByUuid(uuid: string): CachedFixture {
    for (const fixture of this.cachedFixtures) {
      if (fixture.fixture.uuid === uuid) {
        return fixture;
      }
    }
  }

  // Get all profiles to search for (only metadata)
  getSearchProfiles(): Observable<FixtureProfile[]> {
    return this.http.get('fixtures').pipe(
      map((response: object[]) => {
        const searchProfiles: FixtureProfile[] = [];

        for (const profile of response) {
          searchProfiles.push(new FixtureProfile(profile));
        }

        return searchProfiles;
      })
    );
  }

  getProfileByUuid(uuid: string): FixtureProfile {
    for (const fixtureProfile of this.projectService.project.fixtureProfiles) {
      if (fixtureProfile.uuid === uuid) {
        return fixtureProfile;
      }
    }
  }

  loadProfileByUuid(uuid: string): Observable<void> {
    const loadedProfile = this.getProfileByUuid(uuid);

    if (loadedProfile) {
      // This profile is already loaded
      return of(undefined);
    }

    // Load the metadata and the profile
    return forkJoin([this.http.get('fixtures?uuid=' + encodeURI(uuid)), this.http.get('fixture?uuid=' + encodeURI(uuid))]).pipe(
      map((result) => {
        const mergedData = { ...result[0][0], ...result[1] };
        const fixtureProfile = new FixtureProfile(mergedData);
        this.projectService.project.fixtureProfiles.push(fixtureProfile);
      })
    );
  }

  getRotationAngleDeg(value: string): number {
    // convert a rotation angle value into degrees
    if (value.endsWith('deg')) {
      return Number.parseInt(value.replace('deg', ''));
    } else if (value.endsWith('%')) {
      const perc = Number.parseInt(value.replace('%', ''));
      return (perc / 100) * 360;
    }

    return undefined;
  }

  getWheelSlotColors(wheel: FixtureWheel, slotNumber: number): string[] {
    let colors: string[] = [];
    const wheelSlots = this.getWheelSlots(wheel, slotNumber);

    for (const slot of wheelSlots) {
      if (slot.colors && slot.colors.length > 0) {
        colors = colors.concat(slot.colors);
      }
    }

    return colors;
  }

  getMixedWheelSlotColor(wheel: FixtureWheel, slotNumber: number): Color {
    const colors = this.getWheelSlotColors(wheel, slotNumber);
    const colorsRgb: Color[] = [];

    if (colors.length === 0) {
      return undefined;
    }

    for (const color of colors) {
      colorsRgb.push(this.hexToRgb(color));
    }

    return this.mixColors(colorsRgb);
  }

  private componentToHex(c: number): any {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  }

  hexToRgb(hex: string): Color {
    // expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? new Color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)) : null;
  }

  mixColors(colors: Color[]): Color {
    // mix an array of rgb-colors containing r, g, b values to a new color
    let r = 0;
    let g = 0;
    let b = 0;

    for (const color of colors) {
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
    for (const slot of wheel.slots) {
      if (slot.type === slotType) {
        return true;
      }
    }

    return false;
  }

  getWheelByName(profile: FixtureProfile, wheelName: string): FixtureWheel {
    for (const property in profile.wheels) {
      if (property === wheelName) {
        return profile.wheels[property];
      }
    }

    // wheel not found
    return undefined;
  }

  private getWheelSlots(wheel: FixtureWheel, slotNumber: number): FixtureWheelSlot[] {
    // return one slot or two slots, if they are mixed (e.g. slor number 2.5 returns the slots 2 and 3)
    const slots: FixtureWheelSlot[] = [];

    if (!wheel) {
      return slots;
    }

    if (slotNumber - Math.floor(slotNumber) > 0) {
      // two slots are set
      const number = Math.floor(slotNumber);
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
    for (const mode of profile.modes) {
      if (mode.shortName) {
        if (mode.shortName === fixture.modeShortName) {
          return mode;
        }
      } else {
        if (mode.name === fixture.modeShortName) {
          return mode;
        }
      }
    }
  }

  private getFixtureCapability(capability: FixtureCapability, channelName: string, profile: FixtureProfile): CachedFixtureCapability {
    const cachedFixtureCapability = new CachedFixtureCapability();
    cachedFixtureCapability.capability = capability;
    if (capability.slotNumber) {
      // there is a wheel connected to this capability
      if (typeof capability.wheel === 'string') {
        cachedFixtureCapability.wheelName = capability.wheel as string;
      } else if (Array.isArray(capability.wheel)) {
        cachedFixtureCapability.wheelName = capability.wheel[0];
      } else {
        cachedFixtureCapability.wheelName = channelName;
      }
      cachedFixtureCapability.wheel = this.getWheelByName(profile, cachedFixtureCapability.wheelName);
      cachedFixtureCapability.wheelSlots = this.getWheelSlots(cachedFixtureCapability.wheel, capability.slotNumber);
      cachedFixtureCapability.wheelIsColor = this.wheelHasSlotType(cachedFixtureCapability.wheel, FixtureWheelSlotType.Color);
    }
    if (cachedFixtureCapability.capability.dmxRange && cachedFixtureCapability.capability.dmxRange.length === 2) {
      cachedFixtureCapability.centerValue = Math.floor(
        (cachedFixtureCapability.capability.dmxRange[0] + cachedFixtureCapability.capability.dmxRange[1]) / 2
      );
    }
    return cachedFixtureCapability;
  }

  private getCapabilitiesByChannel(
    fixtureChannel: FixtureChannel,
    channelName: string,
    profile: FixtureProfile
  ): CachedFixtureCapability[] {
    const capabilites: CachedFixtureCapability[] = [];

    if (fixtureChannel.capability) {
      capabilites.push(this.getFixtureCapability(fixtureChannel.capability, channelName, profile));
    } else if (fixtureChannel.capabilities) {
      for (const capability of fixtureChannel.capabilities) {
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

    if (isNaN(fixtureChannel.defaultValue as any) && (fixtureChannel.defaultValue as string).endsWith('%')) {
      // percentage value
      const percentage = Number.parseInt((fixtureChannel.defaultValue as string).replace('%', ''));
      const maxValue = this.getMaxValueByChannel(fixtureChannel);
      return (maxValue / 100) * percentage;
    } else {
      // DMX value
      return Number.parseInt(fixtureChannel.defaultValue as any);
    }
  }

  private getColorWheelByChannel(channel: CachedFixtureChannel, profile: FixtureProfile): FixtureWheel {
    for (const channelCapability of channel.capabilities) {
      if (channelCapability.wheelIsColor) {
        return channelCapability.wheel;
      }
    }

    return undefined;
  }

  // private channelInList(channels: CachedFixtureChannel[], name: string): boolean {
  //   for (let channel of channels) {
  //     if (channel.channelName === name) {
  //       return true;
  //     }
  //   }

  //   return false;
  // }

  getChannelByName(fixture: CachedFixture, channelName: string): CachedFixtureChannel {
    for (const channel of fixture.channels) {
      if (
        (channel.name && channel.name === channelName) ||
        (channel.channel && channel.channel.fineChannelAliases.indexOf(channelName) > -1)
      ) {
        return channel;
      }
    }

    return undefined;
  }

  getCachedChannels(profile: FixtureProfile, mode: FixtureMode): CachedFixtureChannel[] {
    const channels: CachedFixtureChannel[] = [];

    if (!mode) {
      return channels;
    }

    for (const availableChannelName of Object.keys(profile.availableChannels)) {
      const availableChannel: FixtureChannel = profile.availableChannels[availableChannelName];

      for (const channel of mode.channels) {
        // check for string channel. It can get creepy for matrix modes
        if (typeof channel === 'string') {
          const modeChannel: string = channel as string;

          // don't check the fine channels. only add the coarse channel.
          if (modeChannel === availableChannelName) {
            const cachedFixtureChannel = new CachedFixtureChannel();
            cachedFixtureChannel.channel = availableChannel;
            cachedFixtureChannel.name = availableChannelName;
            cachedFixtureChannel.capabilities = this.getCapabilitiesByChannel(cachedFixtureChannel.channel, availableChannelName, profile);
            const defaultValue = this.getDefaultValueByChannel(cachedFixtureChannel.channel);
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

    for (const fixture of this.projectService.project.fixtures) {
      const cachedFixture = new CachedFixture();

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
    return (
      type1 === type2 &&
      (!color1 || color1 === color2) &&
      (!wheel1 || wheel1 === wheel2) &&
      (!profileUuid1 || profileUuid1 === profileUuid2)
    );
  }

  settingsFixtureIsSelected(fixture: Fixture): boolean {
    for (const selectedFixture of this.selectedSettingsFixtures) {
      if (selectedFixture === fixture) {
        return true;
      }
    }

    return false;
  }

  switchSettingsFixtureSelection(fixture: Fixture) {
    if (this.settingsFixtureIsSelected(fixture)) {
      this.selectedSettingsFixtures.splice(this.selectedSettingsFixtures.indexOf(fixture), 1);
    } else {
      this.selectedSettingsFixtures.push(fixture);
    }
  }

  getFixtureIconClass(profile: FixtureProfile): string {
    if (!profile) {
      return '';
    }
    if (profile.categories.length === 0) {
      return '';
    }
    if (!profile.categories[0]) {
      return '';
    }
    return profile.categories[0].replace(' ', '-').toLocaleLowerCase();
  }

  updateProfiles() {
    return this.http.post('update-profiles', null);
  }
}
