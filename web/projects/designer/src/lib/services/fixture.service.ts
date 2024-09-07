import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
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
import { UuidService } from './uuid.service';

@Injectable({
  providedIn: 'root',
})
export class FixtureService {
  cachedFixtures: CachedFixture[] = [];

  // is the side-tab settings currently selected?
  settingsSelection = false;

  selectedSettingsFixtures: Fixture[] = [];

  constructor(
    private http: HttpClient,
    private projectService: ProjectService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private uuidService: UuidService
  ) {}

  getFixtureByUuid(uuid: string): Fixture {
    for (const fixture of this.projectService.project.fixtures) {
      if (fixture.uuid === uuid) {
        return fixture;
      }
    }
  }

  private fixtureUuidAndPixelKeyEquals(fixtureUuid1: string, fixtureUuid2: string, pixelKey1: string, pixelKey2: string): boolean {
    return fixtureUuid1 === fixtureUuid2 && ((pixelKey1 == null && pixelKey2 == null) || pixelKey1 === pixelKey2);
  }

  getCachedFixtureByUuid(uuid: string, pixelKey: string): CachedFixture {
    for (const fixture of this.cachedFixtures) {
      if (this.fixtureUuidAndPixelKeyEquals(fixture.fixture.uuid, uuid, fixture.pixelKey, pixelKey)) {
        return fixture;
      }
    }

    // not yet found -> try searching the fixture without pixelKey for the general channels
    if (pixelKey) {
      return undefined;
    }

    for (const fixture of this.cachedFixtures) {
      if (!fixture.pixelKey && fixture.fixture.uuid === uuid) {
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
      return Number.parseInt(value.replace('deg', ''), 10);
    } else if (value.endsWith('%')) {
      const perc = Number.parseInt(value.replace('%', ''), 10);
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
      const percentage = Number.parseInt((fixtureChannel.defaultValue as string).replace('%', ''), 10);
      const maxValue = this.getMaxValueByChannel(fixtureChannel);
      return (maxValue / 100) * percentage;
    } else {
      // DMX value
      return Number.parseInt(fixtureChannel.defaultValue as any, 10);
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

  private getChannelNameWithPixelKey(templateChannelName: string, pixelKey: string) {
    return templateChannelName.replace('$pixelKey', pixelKey);
  }

  private addCachedChannel(
    channels: CachedFixtureChannel[],
    channel: FixtureChannel,
    templateChannelName: string,
    pixelKey: string,
    profile: FixtureProfile
  ) {
    const cachedFixtureChannel = new CachedFixtureChannel();
    const channelName = this.getChannelNameWithPixelKey(templateChannelName, pixelKey);

    cachedFixtureChannel.channel = channel;
    cachedFixtureChannel.name = channelName;
    cachedFixtureChannel.capabilities = this.getCapabilitiesByChannel(cachedFixtureChannel.channel, channelName, profile);
    const defaultValue = this.getDefaultValueByChannel(cachedFixtureChannel.channel);
    if (defaultValue) {
      cachedFixtureChannel.defaultValue = defaultValue;
    }
    cachedFixtureChannel.maxValue = this.getMaxValueByChannel(cachedFixtureChannel.channel);
    cachedFixtureChannel.colorWheel = this.getColorWheelByChannel(cachedFixtureChannel, profile);
    channels.push(cachedFixtureChannel);
  }

  private alphanumericSort(a: string, b: string): number {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }

  private getAllPixelKeys(profile: FixtureProfile) {
    let result: string[] = [];
    for (let pixelKeyX of profile.matrix.pixelKeys) {
      for (let pixelKeyY of pixelKeyX) {
        for (let pixelKeyZ of pixelKeyY) {
          if (pixelKeyZ) {
            result.push(pixelKeyZ);
          }
        }
      }
    }
    return result;
  }

  private getAllPixelGroups(profile: FixtureProfile) {
    let result: string[] = [];
    for (const property of Object.keys(profile.matrix.pixelGroups)) {
      result.push(property);
    }
    return result;
  }

  private getPixelKeysInOrder(profile: FixtureProfile, repeatFor: string[]): string[] {
    let result: string[] = [];

    // could contain just a single string (e.g. 'eachPixelABC') or
    if (repeatFor.length > 1) {
      // an array of pixel (groups)
      result = repeatFor;
    } else if (repeatFor.length === 0) {
      return result;
    } else if (repeatFor[0] === 'eachPixelABC') {
      // Gets computed into an alphanumerically sorted list of all pixelKeys
      if (profile.matrix.pixelCount.length === 3) {
        for (let x = 0; x < profile.matrix.pixelCount[0]; x++) {
          for (let y = 0; y < profile.matrix.pixelCount[1]; y++) {
            for (let z = 0; z < profile.matrix.pixelCount[2]; z++) {
              result.push('Pixel ' + (x + 1) + '-' + (y + 1) + '-' + (z + 1));
            }
          }
        }
      } else {
        result = result.concat(this.getAllPixelKeys(profile));
      }
      result.sort(this.alphanumericSort);
    } else if (repeatFor[0] === 'eachPixelGroup') {
      // Gets computed into an array of all pixel group keys, ordered by appearance in the JSON file
      result = result.concat(this.getAllPixelGroups(profile));
    } else if (repeatFor[0] === 'eachPixelXYZ') {
      for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
        for (let y = 0; y < profile.matrix.pixelKeys[x].length; y++) {
          for (let z = 0; z < profile.matrix.pixelKeys[x][y].length; z++) {
            const pixel = profile.matrix.pixelKeys[x][y][z];
            if (pixel) {
              result.push(pixel);
            }
          }
        }
      }
    } else if (repeatFor[0] === 'eachPixelXZY') {
      for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
        for (let z = 0; z < profile.matrix.pixelKeys[x][0].length; z++) {
          for (let y = 0; y < profile.matrix.pixelKeys[x].length; y++) {
            const pixel = profile.matrix.pixelKeys[x][y][z];
            if (pixel) {
              result.push(pixel);
            }
          }
        }
      }
    } else if (repeatFor[0] === 'eachPixelYXZ') {
      for (let y = 0; y < profile.matrix.pixelKeys[0].length; y++) {
        for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
          for (let z = 0; z < profile.matrix.pixelKeys[x][y].length; z++) {
            const pixel = profile.matrix.pixelKeys[x][y][z];
            if (pixel) {
              result.push(pixel);
            }
          }
        }
      }
    } else if (repeatFor[0] === 'eachPixelYZX') {
      for (let y = 0; y < profile.matrix.pixelKeys[0].length; y++) {
        for (let z = 0; z < profile.matrix.pixelKeys[0][y].length; z++) {
          for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
            const pixel = profile.matrix.pixelKeys[x][y][z];
            if (pixel) {
              result.push(pixel);
            }
          }
        }
      }
    } else if (repeatFor[0] === 'eachPixelZXY') {
      for (let z = 0; z < profile.matrix.pixelKeys[0][0].length; z++) {
        for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
          for (let y = 0; y < profile.matrix.pixelKeys[x].length; y++) {
            const pixel = profile.matrix.pixelKeys[x][y][z];
            if (pixel) {
              result.push(pixel);
            }
          }
        }
      }
    } else if (repeatFor[0] === 'eachPixelZYX') {
      for (let z = 0; z < profile.matrix.pixelKeys[0][0].length; z++) {
        for (let y = 0; y < profile.matrix.pixelKeys[0].length; y++) {
          for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
            const pixel = profile.matrix.pixelKeys[x][y][z];
            if (pixel) {
              result.push(pixel);
            }
          }
        }
      }
    }

    return result;
  }

  getModeChannelCount(profile: FixtureProfile, mode: FixtureMode): number {
    let count: number = 0;

    // already calculated?
    if (mode.channelCount) {
      return mode.channelCount;
    }

    for (let channel of mode.channels) {
      if (channel.insert === 'matrixChannels') {
        if (channel.repeatFor.length > 1) {
          count += channel.repeatFor.length * channel.templateChannels.length;
        } else if (channel.repeatFor[0] === 'eachPixelGroup') {
          count += profile.matrix.pixelGroups.length * channel.templateChannels.length;
        } else if (channel.repeatFor[0].startsWith('eachPixel')) {
          if (profile.matrix.pixelCount.length === 3) {
            count +=
              profile.matrix.pixelCount[0] * profile.matrix.pixelCount[1] * profile.matrix.pixelCount[2] * channel.templateChannels.length;
          } else {
            for (let x = 0; x < profile.matrix.pixelKeys.length; x++) {
              for (let y = 0; y < profile.matrix.pixelKeys[x].length; y++) {
                for (let z = 0; z < profile.matrix.pixelKeys[x][y].length; z++) {
                  const pixel = profile.matrix.pixelKeys[x][y][z];
                  if (pixel) {
                    count += channel.templateChannels.length;
                  }
                }
              }
            }
          }
        }
      } else {
        count++;
      }
    }

    mode.channelCount = count;

    return mode.channelCount;
  }

  getCachedChannels(profile: FixtureProfile, mode: FixtureMode, pixelKey: string): CachedFixtureChannel[] {
    const channels: CachedFixtureChannel[] = [];

    if (!mode) {
      return channels;
    }

    for (const channel of mode.channels) {
      if (channel.name && !pixelKey) {
        // direct reference to a channel
        // don't check the fine channels. only add the coarse channel.
        let channelFound = false;

        for (const availableChannelName of Object.keys(profile.availableChannels)) {
          if (channel.name === availableChannelName) {
            const availableChannel: FixtureChannel = profile.availableChannels[availableChannelName];

            this.addCachedChannel(channels, availableChannel, availableChannelName, null, profile);
          }
        }

        // check the template channels, if not found in the available channels
        if (!channelFound) {
          for (const templateChannelName of Object.keys(profile.templateChannels)) {
            let existingPixelKeys = this.getAllPixelKeys(profile).concat(this.getAllPixelGroups(profile));

            for (const existingPixelKey of existingPixelKeys) {
              const channelName = this.getChannelNameWithPixelKey(templateChannelName, existingPixelKey);

              if (channel.name === channelName) {
                const templateChannel: FixtureChannel = profile.templateChannels[templateChannelName];

                this.addCachedChannel(channels, templateChannel, channelName, existingPixelKey, profile);
              }
            }
          }
        }
      } else {
        // reference a channel through a pixel matrix
        const availablePixelKeys = this.getPixelKeysInOrder(profile, channel.repeatFor);

        if (channel.channelOrder === 'perPixel') {
          // each channel for each pixel

          for (const availablePixelKey of availablePixelKeys) {
            if (availablePixelKey === pixelKey) {
              for (const modeTemplateChannelName of channel.templateChannels) {
                for (const templateChannelName of Object.keys(profile.templateChannels)) {
                  // don't check the fine channels. only add the coarse channel.
                  if (modeTemplateChannelName === templateChannelName) {
                    const templateChannel: FixtureChannel = profile.templateChannels[templateChannelName];

                    this.addCachedChannel(channels, templateChannel, templateChannelName, availablePixelKey, profile);
                  }
                }
              }
            }
          }
        } else if (channel.channelOrder === 'perChannel') {
          // each pixel for each channel

          for (const modeTemplateChannelName of channel.templateChannels) {
            for (const availablePixelKey of availablePixelKeys) {
              if (availablePixelKey === pixelKey) {
                for (const templateChannelName of Object.keys(profile.templateChannels)) {
                  // don't check the fine channels. only add the coarse channel.
                  if (modeTemplateChannelName === templateChannelName) {
                    const templateChannel: FixtureChannel = profile.templateChannels[templateChannelName];

                    this.addCachedChannel(channels, templateChannel, templateChannelName, availablePixelKey, profile);
                  }
                }
              }
            }
          }
        }
      }
    }

    return channels;
  }

  fixtureGetUniquePixelKeys(fixture: Fixture): string[] {
    let pixelKeys: Set<string> = new Set();

    let profile = this.getProfileByUuid(fixture.profileUuid);
    let mode = this.getModeByFixture(profile, fixture);

    // add the unique pixel keys
    for (let channel of mode.channels) {
      this.getPixelKeysInOrder(profile, channel.repeatFor).forEach((str) => {
        pixelKeys.add(str);
      });
    }

    return Array.from(pixelKeys);
  }

  // does the fixture have a general channel without reference to specific pixel keys in the current mode?
  fixtureHasGeneralChannel(fixture: Fixture): boolean {
    let profile = this.getProfileByUuid(fixture.profileUuid);
    let mode = this.getModeByFixture(profile, fixture);

    // add the unique pixel keys
    for (let channel of mode.channels) {
      if (this.getPixelKeysInOrder(profile, channel.repeatFor).length === 0) {
        return true;
      }
    }

    return false;
  }

  updateCachedFixtures() {
    // calculate some frequently used values as a cache to save cpu time
    // afterwards
    this.cachedFixtures = [];

    for (const fixture of this.projectService.project.fixtures) {
      if (this.fixtureHasGeneralChannel(fixture)) {
        const cachedFixture = new CachedFixture();
        cachedFixture.fixture = fixture;
        cachedFixture.profile = this.getProfileByUuid(fixture.profileUuid);
        cachedFixture.mode = this.getModeByFixture(cachedFixture.profile, fixture);
        cachedFixture.channels = this.getCachedChannels(cachedFixture.profile, cachedFixture.mode, null);
        this.cachedFixtures.push(cachedFixture);
      }

      const pixelKeys = this.fixtureGetUniquePixelKeys(fixture);

      for (let pixelKey of pixelKeys) {
        const cachedFixture = new CachedFixture();
        cachedFixture.fixture = fixture;
        cachedFixture.pixelKey = pixelKey;
        cachedFixture.profile = this.getProfileByUuid(fixture.profileUuid);
        cachedFixture.mode = this.getModeByFixture(cachedFixture.profile, fixture);
        cachedFixture.channels = this.getCachedChannels(cachedFixture.profile, cachedFixture.mode, pixelKey);
        this.cachedFixtures.push(cachedFixture);
      }
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

  getNextFreeDmxChannel(fixturePool: Fixture[], neededChannels: number): number {
    // get the next free space for this fixture
    let freeChannels = 0;

    for (let i = 0; i < 512; i++) {
      let occupiedChannels = 0;

      for (const fixture of fixturePool) {
        const profile = this.getProfileByUuid(fixture.profileUuid);
        const mode = this.getModeByFixture(this.getProfileByUuid(fixture.profileUuid), fixture);
        const channelCount = this.getModeChannelCount(profile, mode);

        if (i >= fixture.dmxFirstChannel && i < fixture.dmxFirstChannel + channelCount) {
          // this channel is already occupied by a fixture -> move forward to the end of the fixture
          if (channelCount > occupiedChannels) {
            occupiedChannels = channelCount - (i - fixture.dmxFirstChannel);
          }
        }
      }

      if (occupiedChannels > 0) {
        i += occupiedChannels - 1;
        freeChannels = 0;
      } else {
        freeChannels++;
      }

      if (freeChannels === neededChannels) {
        return i - freeChannels + 1;
      }
    }

    // no free space left for the needed channels
    return -1;
  }

  addFixture(profile: FixtureProfile, fixturePool: Fixture[]): Fixture {
    const fixture = new Fixture();

    fixture.uuid = this.uuidService.getUuid();
    fixture.profileUuid = profile.uuid;
    fixture.name = profile.name;

    if (profile.modes && profile.modes.length > 0) {
      fixture.modeShortName = profile.modes[0].shortName;
    }

    // add the same mode as an existing fixture, if available
    let existingModeShortName: string;
    for (const existingFixture of fixturePool) {
      const existingProfile = this.getProfileByUuid(existingFixture.profileUuid);

      if (existingProfile === profile) {
        existingModeShortName = existingFixture.modeShortName;
        break;
      }
    }

    if (existingModeShortName) {
      fixture.modeShortName = existingModeShortName;
    } else {
      fixture.modeShortName = profile.modes[0].shortName || profile.modes[0].name;
    }

    const mode = this.getModeByFixture(profile, fixture);
    const channelCount = this.getModeChannelCount(profile, mode);
    const firstChannel = this.getNextFreeDmxChannel(fixturePool, channelCount);

    if (firstChannel >= 0) {
      fixture.dmxFirstChannel = firstChannel;
      fixturePool.push(fixture);
      return fixture;
    } else {
      // no free space anymore
      const msg = 'designer.fixture-pool.no-free-space';
      const title = 'designer.fixture-pool.no-free-space-title';

      this.translateService.get([msg, title]).subscribe((result) => {
        this.toastrService.error(result[msg], result[title]);
      });
    }
  }
}
