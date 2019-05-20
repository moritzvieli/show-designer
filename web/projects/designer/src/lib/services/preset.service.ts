import { Injectable } from '@angular/core';
import { Preset } from '../models/preset';
import { Fixture } from '../models/fixture';
import { EffectService } from './effect.service';
import { UuidService } from './uuid.service';
import { Subject } from 'rxjs';
import { FixtureCapabilityType } from '../models/fixture-capability';
import { FixtureCapabilityValue } from '../models/fixture-capability-value';
import { ProjectService } from './project.service';
import { FixtureService } from './fixture.service';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  selectedPreset: Preset;

  // Fires, when the current preview element has changed (scene/preset)
  previewSelectionChanged: Subject<void> = new Subject<void>();

  // Fires, when the fixture selection has changed
  fixtureSelectionChanged: Subject<void> = new Subject<void>();

  // True = show the preset, false = show the selected scene
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

  private capabilityValueMatchesTypeAndOptions(capabilityValue: FixtureCapabilityValue, capabilityType: FixtureCapabilityType, options: any = {}) {
    if (capabilityValue.type == capabilityType
      && (!options.color || capabilityValue.color == options.color)) {

      return true;
    }

    return false;
  }

  deleteCapabilityValue(capabilityType: FixtureCapabilityType, options: any = {}) {
    for (let i = 0; i < this.selectedPreset.capabilityValues.length; i++) {
      if (this.capabilityValueMatchesTypeAndOptions(this.selectedPreset.capabilityValues[i], capabilityType, options)) {
        this.selectedPreset.capabilityValues.splice(i, 1);
        return;
      }
    }
  }

  setCapabilityValue(capabilityType: FixtureCapabilityType, value: number, options: any = {}) {
    // Delete existant properties with this type and set the new value
    this.deleteCapabilityValue(capabilityType, options);

    let fixtureCapabilityValue = new FixtureCapabilityValue();
    fixtureCapabilityValue.type = capabilityType;
    fixtureCapabilityValue.color = options.color;
    fixtureCapabilityValue.value = value;

    this.selectedPreset.capabilityValues.push(fixtureCapabilityValue);
  }

  getCapabilityValue(capabilityType: FixtureCapabilityType, options: any = {}) {
    for (let capabilityValue of this.selectedPreset.capabilityValues) {
      if (this.capabilityValueMatchesTypeAndOptions(capabilityValue, capabilityType, options)) {
        return capabilityValue.value;
      }
    }
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

}
