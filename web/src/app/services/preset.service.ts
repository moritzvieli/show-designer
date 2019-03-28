import { Injectable } from '@angular/core';
import { Preset } from '../models/preset';
import { Fixture } from '../models/fixture';
import { EffectService } from './effect.service';
import { UuidService } from './uuid.service';
import { Subject } from 'rxjs';
import { FixtureCapabilityType } from '../models/fixture-capability';
import { FixtureCapabilityValue } from '../models/fixture-capability-value';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  presets: Preset[] = [];
  selectedPreset: Preset;

  // Fires, when the current preview element has changed (scene/preset)
  previewSelectionChanged: Subject<void> = new Subject<void>();

  // Fires, when the fixture selection has changed
  fixtureSelectionChanged: Subject<void> = new Subject<void>();

  // True = show the preset, false = show the selected scene
  previewPreset: boolean = true;

  constructor(
    private effectService: EffectService,
    private uuidService: UuidService
  ) { }

  getPresetByUuid(uuid: string): Preset {
    for (let preset of this.presets) {
      if (preset.uuid == uuid) {
        return preset;
      }
    }
  }

  fixtureIsSelected(fixture: Fixture): boolean {
    if (!this.selectedPreset) {
      return false;
    }

    for (let selectedFixture of this.selectedPreset.fixtures) {
      if (selectedFixture.uuid == fixture.uuid) {
        return true;
      }
    }

    return false;
  }

  switchFixtureSelection(fixture: Fixture) {
    if (!this.selectedPreset) {
      return;
    }

    // Select a fixture if not yet selected or unselect it otherwise
    if (this.fixtureIsSelected(fixture)) {
      for (let i = 0; i < this.selectedPreset.fixtures.length; i++) {
        if (this.selectedPreset.fixtures[i].uuid == fixture.uuid) {
          this.selectedPreset.fixtures.splice(i, 1);
          break;
        }
      }
    } else {
      this.selectedPreset.fixtures.push(fixture);
    }
  }

  private capabilityValueMatchesTypeAndOptions(capabilityValue: FixtureCapabilityValue, capabilityType: FixtureCapabilityType, options: any = {}) {
    if(capabilityValue.type == capabilityType 
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
    this.selectedPreset = this.presets[index];
    this.previewSelectionChanged.next();
  }

  addPreset(name?: string): void {
    let preset: Preset = new Preset(this.uuidService);
    preset.name = name || 'Preset';

    // Insert the new preset before the highest currently selected preset
    let highestSelectedPresetIndex = 0;

    for (let i = 0; i < this.presets.length; i++) {
      if (this.selectedPreset == this.presets[i]) {
        highestSelectedPresetIndex = i;
        break;
      }
    }

    this.presets.splice(highestSelectedPresetIndex, 0, preset);
    this.selectPreset(highestSelectedPresetIndex);
  }

}
