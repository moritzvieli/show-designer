import { Injectable } from '@angular/core';
import { Preset } from '../models/preset';
import { Fixture } from '../models/fixture';
import { EffectService } from './effect.service';
import { UuidService } from './uuid.service';
import { Subject } from 'rxjs';
import { ProjectService } from './project.service';
import { FixtureService } from './fixture.service';
import { FixtureChannelValue } from '../models/fixture-channel-value';
import { FixtureCapabilityType, FixtureCapabilityColor } from '../models/fixture-capability';
import { FixtureCapabilityValue } from '../models/fixture-capability-value';
import { CachedFixtureChannel } from '../models/cached-fixture-channel';
import { CachedFixtureCapability } from '../models/cached-fixture-capability';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from 'projects/designer/dist/lib/models/fixture-mode';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  selectedPreset: Preset;

  // fires, when the current preview element has changed (scene/preset)
  previewSelectionChanged: Subject<void> = new Subject<void>();

  // fires, when the fixture selection has changed
  fixtureSelectionChanged: Subject<void> = new Subject<void>();

  // fires, when the selected color has changed. This is required,
  // because detectChanges is not enough to trigger different components.
  fixtureColorChanged: Subject<void> = new Subject<void>();

  // true = show the preset, false = show the selected scene
  previewPreset: boolean = true;

  constructor(
    private effectService: EffectService,
    private uuidService: UuidService,
    private projectService: ProjectService,
    private fixtureService: FixtureService
  ) { }

  getPresetByUuid(uuid: string): Preset {
    for (let preset of this.projectService.project.presets) {
      if (preset.uuid == uuid) {
        return preset;
      }
    }
  }

  fixtureIsSelected(fixture: Fixture, preset?: Preset): boolean {
    if (!preset) {
      if (this.selectedPreset) {
        preset = this.selectedPreset;
      } else {
        return false;
      }
    }

    for (let selectedFixtureUuid of this.selectedPreset.fixtureUuids) {
      if (selectedFixtureUuid == fixture.uuid) {
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
        let projectFixture = this.fixtureService.getFixtureByUuid(this.selectedPreset.fixtureUuids[i]);
        if (projectFixture.dmxFirstChannel == fixture.dmxFirstChannel) {
          this.selectedPreset.fixtureUuids.splice(i, 1);
        }
      }
    } else {
      for (let projectFixture of this.projectService.project.fixtures) {
        if (projectFixture.dmxFirstChannel == fixture.dmxFirstChannel) {
          this.selectedPreset.fixtureUuids.push(projectFixture.uuid);
        }
      }
    }
  }

  public removeDeletedFixtures() {
    // after changing the configuration in the fixture pool, we might need to
    // delete some fixtures
    for (let preset of this.projectService.project.presets) {
      for (let i = 0; i < preset.fixtureUuids.length; i++) {
        let presetFixture = this.fixtureService.getFixtureByUuid(preset.fixtureUuids[i]);
        if (!presetFixture) {
          preset.fixtureUuids.splice(i, 1);
        }
      }
    }
  }

  public updateFixtureSelection() {
    // after changing the configuration in the fixture pool, we might need to
    // select some more fixtures on the same channel as already selected ones
    for (let preset of this.projectService.project.presets) {
      for (let presetFixtureUuid of preset.fixtureUuids) {
        let presetFixture = this.fixtureService.getFixtureByUuid(presetFixtureUuid);
        for (let projectFixture of this.projectService.project.fixtures) {
          if (projectFixture.dmxFirstChannel == presetFixture.dmxFirstChannel && !this.fixtureIsSelected(projectFixture, preset)) {
            preset.fixtureUuids.push(projectFixture.uuid);
          }
        }
      }
    }
  }

  deleteCapabilityValue(preset: Preset, capabilityType: FixtureCapabilityType, color?: FixtureCapabilityColor, wheel?: string, templateUuid?: string) {
    for (let i = 0; i < preset.fixtureCapabilityValues.length; i++) {
      if (this.fixtureService.capabilitiesMatch(
        preset.fixtureCapabilityValues[i].type,
        capabilityType,
        preset.fixtureCapabilityValues[i].color,
        color,
        preset.fixtureCapabilityValues[i].wheel,
        wheel,
        preset.fixtureCapabilityValues[i].fixtureTemplateUuid,
        templateUuid
      )) {
        preset.fixtureCapabilityValues.splice(i, 1);
        return;
      }
    }
  }

  setCapabilityValue(preset: Preset, capabilityType: FixtureCapabilityType, valuePercentage: number, slotNumber?: number, color?: FixtureCapabilityColor, wheel?: string, templateUuid?: string) {
    // Delete existant properties with this type and set the new value
    this.deleteCapabilityValue(preset, capabilityType, color, wheel, templateUuid);

    let fixtureCapabilityValue = new FixtureCapabilityValue();
    fixtureCapabilityValue.type = capabilityType;
    fixtureCapabilityValue.color = color;
    fixtureCapabilityValue.wheel = wheel;
    fixtureCapabilityValue.valuePercentage = valuePercentage;
    fixtureCapabilityValue.slotNumber = slotNumber;
    fixtureCapabilityValue.fixtureTemplateUuid = templateUuid;

    preset.fixtureCapabilityValues.push(fixtureCapabilityValue);
  }

  getCapabilityValue(preset: Preset, capabilityType: FixtureCapabilityType, color?: FixtureCapabilityColor, wheel?: string, templateUuid?: string): FixtureCapabilityValue {
    for (let capabilityValue of preset.fixtureCapabilityValues) {
      if (this.fixtureService.capabilitiesMatch(
        capabilityValue.type,
        capabilityType,
        capabilityValue.color,
        color,
        capabilityValue.wheel,
        wheel,
        capabilityValue.fixtureTemplateUuid,
        templateUuid
      )) {
        return capabilityValue;
      }
    }
    return undefined;
  }

  deleteChannelValue(channelName: string, fixtureTemplateUuid: string) {
    for (let i = 0; i < this.selectedPreset.fixtureChannelValues.length; i++) {
      if (this.selectedPreset.fixtureChannelValues[i].channelName == channelName && this.selectedPreset.fixtureChannelValues[i].fixtureTemplateUuid == fixtureTemplateUuid) {
        this.selectedPreset.fixtureChannelValues.splice(i, 1);
        return;
      }
    }
  }

  setChannelValue(channelName: string, fixtureTemplateUuid: string, value: number) {
    // Delete existant properties with this type and set the new value
    this.deleteChannelValue(channelName, fixtureTemplateUuid);

    let fixtureChannelValue = new FixtureChannelValue();
    fixtureChannelValue.channelName = channelName;
    fixtureChannelValue.fixtureTemplateUuid = fixtureTemplateUuid;
    fixtureChannelValue.value = value;

    this.selectedPreset.fixtureChannelValues.push(fixtureChannelValue);
  }

  getChannelValue(channelName: string, fixtureTemplateUuid: string): number {
    for (let channelValue of this.selectedPreset.fixtureChannelValues) {
      if (channelValue.channelName == channelName && channelValue.fixtureTemplateUuid == fixtureTemplateUuid) {
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

    if (colorRed != undefined && colorGreen != undefined && colorBlue != undefined) {
      for (let capability of cachedChannel.capabilities) {
        if (capability.capability.slotNumber) {
          let mixedColor = this.fixtureService.getMixedWheelSlotColor(capability.wheel, capability.capability.slotNumber);
          if (mixedColor) {
            let diff = Math.abs(mixedColor.red - colorRed) + Math.abs(mixedColor.green - colorGreen) + Math.abs(mixedColor.blue - colorBlue);
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
    for (let fixtureUuid of this.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
      for (let channel of fixture.channels) {
        if (channel.fixtureChannel) {
          for (let capability of channel.capabilities) {
            if (capability.capability.type == type) {
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

    // one of the templates has a color intensity
    if (this.hasCapabilityType(FixtureCapabilityType.ColorIntensity)) {
      return true;
    }

    return false;
  }

  hasCapabilityColorOrColorWheel(): boolean {
    // TODO optionally color temperature and color white (see stairville/mh-100)

    // one of the templates has a color intensity
    if (this.hasCapabilityColor()) {
      return true;
    }

    // a color wheel is involved
    for (let fixtureUuid of this.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
      for (let channel of fixture.channels) {
        if (channel.colorWheel) {
          return true;
        }
      }
    }

    return false;
  }

  hasCapabilityPanTilt(): boolean {
    // TODO there is at least one pan and one tilt channel
    // TODO optionally endless pan/tilt and movement speed
    return false;
  }

  selectPreset(index: number) {
    this.effectService.selectedEffect = undefined;
    this.selectedPreset = this.projectService.project.presets[index];
    this.previewSelectionChanged.next();
  }

  addPreset(name?: string): void {
    let preset: Preset = new Preset();
    preset.uuid = this.uuidService.getUuid();
    preset.name = name || 'Preset';

    // Insert the new preset before the highest currently selected preset
    let highestSelectedPresetIndex = 0;

    for (let i = 0; i < this.projectService.project.presets.length; i++) {
      if (this.selectedPreset == this.projectService.project.presets[i]) {
        highestSelectedPresetIndex = i;
        break;
      }
    }

    this.projectService.project.presets.splice(highestSelectedPresetIndex, 0, preset);
    this.selectPreset(highestSelectedPresetIndex);
  }

  getSelectedTemplates() {
    let templates: FixtureTemplate[] = [];

    for (let fixtureUuid of this.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let template = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);

      if (templates.indexOf(template) < 0) {
        templates.push(template);
      }
    }

    return templates;
  }

  getSelectedTemplateChannels(selectedTemplates: FixtureTemplate[]) {
    let availableChannels: Map<FixtureTemplate, CachedFixtureChannel[]> = new Map<FixtureTemplate, CachedFixtureChannel[]>();

    let calculatedTemplateModes = new Map<FixtureTemplate, FixtureMode[]>();
    for (let template of selectedTemplates) {
      let modes: FixtureMode[] = [];
      for (let fixtureUuid of this.selectedPreset.fixtureUuids) {
        let fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
        if (modes.indexOf(fixture.mode) < 0) {
          modes.push(fixture.mode);
        }
      }
      calculatedTemplateModes.set(template, modes);
    }

    // calculate all required channels from the modes
    calculatedTemplateModes.forEach((modes: FixtureMode[], template: FixtureTemplate) => {
      let templateChannels: CachedFixtureChannel[] = [];
      for (let mode of modes) {
        let channels = this.fixtureService.getCachedChannels(template, mode);
        for (let channel of channels) {
          // only add the channel, if no channel with the same name has already been added
          // (e.g. a fine channel)
          if (channel.fixtureChannel && !templateChannels.find(c => c.channelName == channel.channelName)) {
            templateChannels.push(channel);
          }
        }
      }
      availableChannels.set(template, templateChannels);
    });

    return availableChannels;
  }

}
