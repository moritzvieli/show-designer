import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CachedFixtureCapability } from '../models/cached-fixture-capability';
import { CachedFixtureChannel } from '../models/cached-fixture-channel';
import { Fixture } from '../models/fixture';
import { FixtureCapabilityColor, FixtureCapabilityType } from '../models/fixture-capability';
import { FixtureCapabilityValue } from '../models/fixture-capability-value';
import { FixtureChannelValue } from '../models/fixture-channel-value';
import { FixtureMode } from '../models/fixture-mode';
import { FixtureProfile } from '../models/fixture-profile';
import { Preset } from '../models/preset';
import { AnimationService } from './animation.service';
import { ConfigService } from './config.service';
import { EffectService } from './effect.service';
import { FixtureService } from './fixture.service';
import { ProjectService } from './project.service';
import { UuidService } from './uuid.service';

@Injectable({
  providedIn: 'root',
})
export class PresetService {
  selectedPreset: Preset;

  // fires, when the current preview element has changed (scene/preset)
  previewSelectionChanged: Subject<void> = new Subject<void>();

  // fires, when the fixture selection has changed
  fixtureSelectionChanged: Subject<void> = new Subject<void>();

  // fires, when the fixture selection has changed for settings
  fixtureSelectionSettingsChanged: Subject<void> = new Subject<void>();

  // fires, when the selected color has changed. This is required,
  // because detectChanges is not enough to trigger different components.
  fixtureColorChanged: Subject<void> = new Subject<void>();

  livePreviewTimer: any;
  liveChangePending = false;

  constructor(
    private effectService: EffectService,
    private uuidService: UuidService,
    private projectService: ProjectService,
    private fixtureService: FixtureService,
    private configService: ConfigService,
    private http: HttpClient,
    private animationService: AnimationService
  ) {}

  getPresetByUuid(uuid: string): Preset {
    for (const preset of this.projectService.project.presets) {
      if (preset.uuid === uuid) {
        return preset;
      }
    }
  }

  fixtureIsSelected(fixture: Fixture, preset?: Preset): boolean {
    // is the passed fixture selected in the passed/currently selected preset?
    if (!preset) {
      if (this.selectedPreset) {
        preset = this.selectedPreset;
      } else {
        return false;
      }
    }

    for (const selectedFixtureUuid of preset.fixtureUuids) {
      if (selectedFixtureUuid === fixture.uuid) {
        return true;
      }
    }

    return false;
  }

  switchFixtureSelection(fixture: Fixture) {
    if (!this.selectedPreset) {
      return;
    }

    // select all fixtures at the specified start channel or unselect them,
    // if already selected
    if (this.fixtureIsSelected(fixture)) {
      for (let i = this.selectedPreset.fixtureUuids.length - 1; i >= 0; i--) {
        const projectFixture = this.fixtureService.getFixtureByUuid(this.selectedPreset.fixtureUuids[i]);
        if (projectFixture.dmxFirstChannel === fixture.dmxFirstChannel) {
          this.selectedPreset.fixtureUuids.splice(i, 1);
        }
      }
    } else {
      for (const projectFixture of this.projectService.project.fixtures) {
        if (projectFixture.dmxFirstChannel === fixture.dmxFirstChannel) {
          this.selectedPreset.fixtureUuids.push(projectFixture.uuid);
        }
      }
    }
  }

  selectAllFixtures() {
    if (!this.selectedPreset) {
      return;
    }

    for (const fixture of this.projectService.project.fixtures) {
      if (!this.fixtureIsSelected(fixture)) {
        this.selectedPreset.fixtureUuids.push(fixture.uuid);
      }
    }
  }

  selectNoFixtures() {
    if (!this.selectedPreset) {
      return;
    }

    this.selectedPreset.fixtureUuids = [];
  }

  public removeDeletedFixtures() {
    // after changing the configuration in the fixture pool, we might need to
    // delete some fixtures
    for (const preset of this.projectService.project.presets) {
      for (let i = preset.fixtureUuids.length - 1; i >= 0; i--) {
        const presetFixture = this.fixtureService.getFixtureByUuid(preset.fixtureUuids[i]);
        if (!presetFixture) {
          preset.fixtureUuids.splice(i, 1);
        }
      }
    }
  }

  public updateFixtureSelection() {
    // after changing the configuration in the fixture pool, we might need to
    // select some more fixtures on the same channel as already selected ones
    for (const preset of this.projectService.project.presets) {
      for (let i = preset.fixtureUuids.length - 1; i >= 0; i--) {
        const presetFixture = this.fixtureService.getFixtureByUuid(preset.fixtureUuids[i]);
        for (const projectFixture of this.projectService.project.fixtures) {
          if (projectFixture.dmxFirstChannel === presetFixture.dmxFirstChannel && !this.fixtureIsSelected(projectFixture, preset)) {
            preset.fixtureUuids.push(projectFixture.uuid);
          }
        }
      }
    }
  }

  deleteCapabilityValue(
    preset: Preset,
    capabilityType: FixtureCapabilityType,
    color?: FixtureCapabilityColor,
    wheel?: string,
    profileUuid?: string
  ) {
    for (let i = 0; i < preset.fixtureCapabilityValues.length; i++) {
      if (
        this.fixtureService.capabilitiesMatch(
          preset.fixtureCapabilityValues[i].type,
          capabilityType,
          preset.fixtureCapabilityValues[i].color,
          color,
          preset.fixtureCapabilityValues[i].wheel,
          wheel,
          preset.fixtureCapabilityValues[i].profileUuid,
          profileUuid
        )
      ) {
        preset.fixtureCapabilityValues.splice(i, 1);
        return;
      }
    }
  }

  setCapabilityValue(
    preset: Preset,
    capabilityType: FixtureCapabilityType,
    valuePercentage: number,
    slotNumber?: number,
    color?: FixtureCapabilityColor,
    wheel?: string,
    profileUuid?: string
  ) {
    // Delete existant properties with this type and set the new value
    this.deleteCapabilityValue(preset, capabilityType, color, wheel, profileUuid);

    const fixtureCapabilityValue = new FixtureCapabilityValue();
    fixtureCapabilityValue.type = capabilityType;
    fixtureCapabilityValue.color = color;
    fixtureCapabilityValue.wheel = wheel;
    fixtureCapabilityValue.valuePercentage = valuePercentage;
    fixtureCapabilityValue.slotNumber = slotNumber;
    fixtureCapabilityValue.profileUuid = profileUuid;

    preset.fixtureCapabilityValues.push(fixtureCapabilityValue);
  }

  getCapabilityValue(
    preset: Preset,
    capabilityType: FixtureCapabilityType,
    color?: FixtureCapabilityColor,
    wheel?: string,
    profileUuid?: string
  ): FixtureCapabilityValue {
    for (const capabilityValue of preset.fixtureCapabilityValues) {
      if (
        this.fixtureService.capabilitiesMatch(
          capabilityValue.type,
          capabilityType,
          capabilityValue.color,
          color,
          capabilityValue.wheel,
          wheel,
          capabilityValue.profileUuid,
          profileUuid
        )
      ) {
        return capabilityValue;
      }
    }
    return undefined;
  }

  deleteChannelValue(channelName: string, profileUuid: string) {
    for (let i = 0; i < this.selectedPreset.fixtureChannelValues.length; i++) {
      if (
        this.selectedPreset.fixtureChannelValues[i].channelName === channelName &&
        this.selectedPreset.fixtureChannelValues[i].profileUuid === profileUuid
      ) {
        this.selectedPreset.fixtureChannelValues.splice(i, 1);
        return;
      }
    }
  }

  setChannelValue(channelName: string, profileUuid: string, value: number) {
    // Delete existant properties with this type and set the new value
    this.deleteChannelValue(channelName, profileUuid);

    const fixtureChannelValue = new FixtureChannelValue();
    fixtureChannelValue.channelName = channelName;
    fixtureChannelValue.profileUuid = profileUuid;
    fixtureChannelValue.value = value;

    this.selectedPreset.fixtureChannelValues.push(fixtureChannelValue);
  }

  getChannelValue(channelName: string, profileUuid: string): number {
    for (const channelValue of this.selectedPreset.fixtureChannelValues) {
      if (channelValue.channelName === channelName && channelValue.profileUuid === profileUuid) {
        return channelValue.value;
      }
    }
  }

  getApproximatedColorWheelCapability(preset: Preset, cachedChannel: CachedFixtureChannel): CachedFixtureCapability {
    // return an approximated wheel slot channel capability, if a color or a slot on a different
    // wheel has been selected
    let colorRed: number;
    let colorGreen: number;
    let colorBlue: number;
    let lowestDiff = Number.MAX_VALUE;
    let lowestDiffCapability: CachedFixtureCapability;
    let capabilityValue: FixtureCapabilityValue;

    capabilityValue = this.getCapabilityValue(preset, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Red);
    if (capabilityValue) {
      colorRed = 255 * capabilityValue.valuePercentage;
    }
    capabilityValue = this.getCapabilityValue(preset, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Green);
    if (capabilityValue) {
      colorGreen = 255 * capabilityValue.valuePercentage;
    }
    capabilityValue = this.getCapabilityValue(preset, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Blue);
    if (capabilityValue) {
      colorBlue = 255 * capabilityValue.valuePercentage;
    }

    if (!colorRed && !colorGreen && !colorBlue) {
      // no color found -> search the first color wheel
      // TODO
    }

    if (colorRed !== undefined && colorGreen !== undefined && colorBlue !== undefined) {
      for (const capability of cachedChannel.capabilities) {
        if (capability.capability.slotNumber) {
          const mixedColor = this.fixtureService.getMixedWheelSlotColor(capability.wheel, capability.capability.slotNumber);
          if (mixedColor) {
            const diff =
              Math.abs(mixedColor.red - colorRed) + Math.abs(mixedColor.green - colorGreen) + Math.abs(mixedColor.blue - colorBlue);

            if (diff < lowestDiff) {
              lowestDiff = diff;
              lowestDiffCapability = capability;
            }
          }
        }
      }
    }

    return lowestDiffCapability;
  }

  private hasCapabilityType(type: FixtureCapabilityType): boolean {
    // there is at least one channel with at least one intensity capability
    for (const fixtureUuid of this.selectedPreset.fixtureUuids) {
      const fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
      for (const channel of fixture.channels) {
        if (channel.channel) {
          for (const capability of channel.capabilities) {
            if (capability.capability.type === type) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  hasCapabilityDimmer(): boolean {
    return this.hasCapabilityType(FixtureCapabilityType.Intensity);
  }

  hasCapabilityColor(): boolean {
    // TODO optionally color temperature and color white (see stairville/mh-100)

    // one of the profiles has a color intensity
    if (this.hasCapabilityType(FixtureCapabilityType.ColorIntensity)) {
      return true;
    }

    return false;
  }

  hasCapabilityColorOrColorWheel(): boolean {
    // TODO optionally color temperature and color white (see stairville/mh-100)

    // one of the profiles has a color intensity
    if (this.hasCapabilityColor()) {
      return true;
    }

    // a color wheel is involved
    for (const fixtureUuid of this.selectedPreset.fixtureUuids) {
      const fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
      for (const channel of fixture.channels) {
        if (channel.colorWheel) {
          return true;
        }
      }
    }

    return false;
  }

  hasCapabilityPanTilt(): boolean {
    let hasPan = false;
    let hasTilt = false;

    // there is at least one pan and one tilt channel
    if (this.hasCapabilityType(FixtureCapabilityType.Pan)) {
      hasPan = true;
    }

    if (this.hasCapabilityType(FixtureCapabilityType.Tilt)) {
      hasTilt = true;
    }

    if (hasPan && hasTilt) {
      return true;
    }

    return false;
  }

  selectPreset(index: number) {
    this.effectService.selectedEffect = undefined;
    this.selectedPreset = this.projectService.project.presets[index];
    this.projectService.project.selectedPresetUuid = this.projectService.project.presets[index].uuid;
    this.autoOpenFirstEffect();
    this.previewSelectionChanged.next();
    this.previewLive();
  }

  autoOpenFirstEffect() {
    // open the first effect, if the preset only has one
    if (this.selectedPreset && this.selectedPreset.effects.length === 1) {
      this.effectService.selectedEffect = this.selectedPreset.effects[0];
    }
  }

  addPreset(name?: string): void {
    const preset: Preset = new Preset();
    preset.uuid = this.uuidService.getUuid();
    preset.name = name || 'New Preset';

    // Insert the new preset before the highest currently selected preset
    let highestSelectedPresetIndex = 0;

    for (let i = 0; i < this.projectService.project.presets.length; i++) {
      if (this.selectedPreset === this.projectService.project.presets[i]) {
        highestSelectedPresetIndex = i;
        break;
      }
    }

    this.projectService.project.presets.splice(highestSelectedPresetIndex, 0, preset);
    this.selectPreset(highestSelectedPresetIndex);
  }

  getSelectedProfiles() {
    const profiles: FixtureProfile[] = [];

    if (!this.selectedPreset) {
      return profiles;
    }

    for (const fixtureUuid of this.selectedPreset.fixtureUuids) {
      const fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      const profile = this.fixtureService.getProfileByUuid(fixture.profileUuid);

      if (profiles.indexOf(profile) < 0) {
        profiles.push(profile);
      }
    }

    return profiles;
  }

  getSelectedProfileChannels(selectedProfiles: FixtureProfile[]) {
    const availableChannels: Map<FixtureProfile, CachedFixtureChannel[]> = new Map<FixtureProfile, CachedFixtureChannel[]>();

    const calculatedProfileModes = new Map<FixtureProfile, FixtureMode[]>();
    for (const profile of selectedProfiles) {
      const modes: FixtureMode[] = [];
      for (const fixtureUuid of this.selectedPreset.fixtureUuids) {
        const fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
        if (modes.indexOf(fixture.mode) < 0) {
          modes.push(fixture.mode);
        }
      }
      calculatedProfileModes.set(profile, modes);
    }

    // calculate all required channels from the modes
    calculatedProfileModes.forEach((modes: FixtureMode[], profile: FixtureProfile) => {
      const profileChannels: CachedFixtureChannel[] = [];
      for (const mode of modes) {
        const channels = this.fixtureService.getCachedChannels(profile, mode);
        for (const channel of channels) {
          // only add the channel, if no channel with the same name has already been added
          // (e.g. a fine channel)
          if (channel.channel && !profileChannels.find((c) => c.name === channel.name)) {
            profileChannels.push(channel);
          }
        }
      }
      availableChannels.set(profile, profileChannels);
    });

    return availableChannels;
  }

  previewLive(compositionName: string = '', positionMillis?: number) {
    if (!this.configService.livePreview) {
      return;
    }

    // collect all changes and delay them to not flood the backend
    // (except play events. they need to be delivered always)
    if (this.livePreviewTimer && !compositionName) {
      this.liveChangePending = true;
      return;
    }

    let position = positionMillis;

    if (position === undefined) {
      position = Math.round(this.animationService.timeMillis);
    }

    this.http
      .post('preview?positionMillis=' + position + '&compositionName=' + compositionName, JSON.stringify(this.projectService.project))
      .subscribe();

    this.liveChangePending = false;

    if (!compositionName) {
      this.livePreviewTimer = setTimeout(() => {
        this.livePreviewTimer = undefined;
        if (this.liveChangePending) {
          this.http
            .post('preview?positionMillis=' + position + '&compositionName=' + compositionName, JSON.stringify(this.projectService.project))
            .subscribe();
        }
      }, 50);
    }
  }

  stopPreviewPlay() {
    if (!this.configService.livePreview) {
      return;
    }

    this.http.post('stop-preview-play', null).subscribe();
  }
}
