import { Injectable } from '@angular/core';
import { Preset } from '../models/preset';
import { Fixture } from '../models/fixture';
import { FixturePropertyType } from '../models/fixture-property';
import { FixturePropertyValue } from '../models/fixture-property-value';
import { EffectService } from './effect.service';
import { UuidService } from './uuid.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  presets: Preset[] = [];
  selectedPreset: Preset;

  // Fires, when the current preview element has changed
  previewSelectionChanged: Subject<void> = new Subject<void>();

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
    if(!this.selectedPreset) {
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
    if(!this.selectedPreset) {
      return;
    }

    // Select a fixture if not yet selected or unselect it otherwise
    if(this.fixtureIsSelected(fixture)) {
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

  deletePropertyValue(preset: Preset, property: FixturePropertyType) {
    for(let i = 0; i < preset.fixturePropertyValues.length; i++) {
      if(preset.fixturePropertyValues[i].fixturePropertyType == property) {
        preset.fixturePropertyValues.splice(i, 1);
      }
    }
  }

  roundDmx(value: number): number {
    if (value < 0) {
      return 0;
    }

    if (value > 255) {
      return 255;
    }

    return Math.round(value);
  }

  getDmxFineValue(value: number): number {
    // Return the fine value for this value
    return 255 * (value - this.roundDmx(value)) / 100;
  }

  setPropertyValue(preset: Preset, property: FixturePropertyType, value: number) {
    // Delete existant properties with this type and set the new value
    this.deletePropertyValue(preset, property);

    let fixturePropertyValue = new FixturePropertyValue();
    fixturePropertyValue.fixturePropertyType = property;
    fixturePropertyValue.value = value;

    preset.fixturePropertyValues.push(fixturePropertyValue);
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
