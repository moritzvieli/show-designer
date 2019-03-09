import { Injectable } from '@angular/core';
import { Preset } from '../models/preset';
import { Fixture } from '../models/fixture';
import { FixturePropertyRange } from '../models/fixture-property-range';
import { FixturePropertyType } from '../models/fixture-property';
import { FixturePropertyValue } from '../models/fixture-property-value';

@Injectable({
  providedIn: 'root'
})
export class PresetService {

  presets: Preset[] = [];
  selectedPreset: Preset;

  constructor() { }

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
          return;
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

  setPropertyValue(preset: Preset, property: FixturePropertyType, propertyFine: FixturePropertyType, value: number) {
    // Delete existant properties with this type and set the new value
    this.deletePropertyValue(preset, property);

    let fixturePropertyValue = new FixturePropertyValue();
    fixturePropertyValue.fixturePropertyType = property;
    fixturePropertyValue.value = this.roundDmx(value);

    preset.fixturePropertyValues.push(fixturePropertyValue);

    if(propertyFine) {
      this.deletePropertyValue(preset, propertyFine);
  
      let fixturePropertyValue = new FixturePropertyValue();
      fixturePropertyValue.fixturePropertyType = propertyFine;
      fixturePropertyValue.value = this.getDmxFineValue(value);
  
      preset.fixturePropertyValues.push(fixturePropertyValue);
    }
  }

}
