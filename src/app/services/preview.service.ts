import { Injectable } from '@angular/core';
import { Universe } from '../models/universe';
import { FixturePropertyValue } from '../models/fixture-property-value';
import { FixturePropertyType } from '../models/fixture-property';
import { Fixture } from '../models/fixture';
import { PresetService } from './preset.service';
import { FixtureService } from './fixture.service';
import { SceneService, PresetRegionScene } from './scene.service';
import { TimelineService } from './timeline.service';
import { UniverseService } from './universe.service';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { EffectChannel } from '../models/effect';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  constructor(
    private presetService: PresetService,
    private fixtureService: FixtureService,
    private sceneService: SceneService,
    private timelineService: TimelineService,
    private universeService: UniverseService
  ) { }

  private alreadyCalculatedFixture(fixtures: Fixture[], fixtureIndex: number): Fixture {
    // Has this fixture already been calculated (same universe and dmx start address as a fixture before)
    // --> return it
    for (let i = 0; i < fixtureIndex; i++) {
      let calculatedFixture = fixtures[i];

      if (calculatedFixture.universeUuid == fixtures[fixtureIndex].universeUuid
        && calculatedFixture.firstChannel == fixtures[fixtureIndex].firstChannel) {

        return calculatedFixture;
      }
    }

    return undefined;
  }

  private addEffectProperties(value: number, property: FixturePropertyType, propertyFine: FixturePropertyType): FixturePropertyValue[] {
    let effectPropertyValues: FixturePropertyValue[] = [];
    let effectPropertyValue: FixturePropertyValue;

    effectPropertyValue = new FixturePropertyValue();
    effectPropertyValue.fixturePropertyType = property;
    effectPropertyValue.value = this.presetService.roundDmx(value);
    effectPropertyValues.push(effectPropertyValue);

    effectPropertyValue = new FixturePropertyValue();
    effectPropertyValue.fixturePropertyType = propertyFine;
    effectPropertyValue.value = this.presetService.getDmxFineValue(value);
    effectPropertyValues.push(effectPropertyValue);

    return effectPropertyValues;
  }

  private getPresets(timeMillis: number): PresetRegionScene[] {
    // Get relevant presets in correct order to process with their corresponding scene, if available
    let presets: PresetRegionScene[] = [];

    if (this.timelineService.playState == 'playing') {
      // Overwrite the current time with the playing time, if we're in playback mode
      timeMillis = this.timelineService.waveSurfer.getCurrentTime() * 1000;

      // Only use active presets in current regions
      presets.concat(this.sceneService.getPresetsInTime(timeMillis));
    } else {
      if (this.presetService.previewPreset) {
        // Only preview the selected preset
        if (this.presetService.selectedPreset) {
          presets.push(new PresetRegionScene(this.presetService.selectedPreset, undefined, undefined));
        }
      } else {
        // Preview the selected scenes
        let scenes = this.sceneService.selectedScenes;

        for (let sceneIndex = scenes.length - 1; sceneIndex >= 0; sceneIndex--) {
          for (let presetIndex = scenes[sceneIndex].presetUuids.length - 1; presetIndex >= 0; presetIndex--) {
            presets.push(new PresetRegionScene(this.presetService.getPresetByUuid(scenes[sceneIndex].presetUuids[presetIndex]), undefined, scenes[sceneIndex]));
          }
        }
      }
    }

    return presets;
  }

  public resetDmxUniverses() {
    // Reset all DMX universes
    for (let universe of this.universeService.universes) {
      universe.channelValues = [];
      for (let i = 0; i < 512; i++) {
        universe.channelValues.push(0);
      }
    }
  }

  private setPropertyValue(universe: Universe, channel: number, previewProperties: FixturePropertyValue[], propertyValue: FixturePropertyValue, intensityPercentage: number) {
    let newValue: number = propertyValue.value;
    let existingValue: number = 0;

    if (intensityPercentage < 1) {
      // We need to mix a possibly existing value (or the default value 0) with the new value (fading)

      // Get the existant value for this property
      for (let existingPropertyValue of previewProperties) {
        if (existingPropertyValue.fixturePropertyType == propertyValue.fixturePropertyType) {
          existingValue = existingPropertyValue.value;
          break;
        }
      }

      // Mix the existing value with the new value

    }

    // Remove the existant value, if available
    for (let i = 0; i < previewProperties.length; i++) {
      if (previewProperties[i].fixturePropertyType == propertyValue.fixturePropertyType) {
        previewProperties.splice(i, 1);
        break;
      }
    }

    // Set the new value
    universe.channelValues[channel] = newValue;
    previewProperties.push(propertyValue);
  }

  public getFixturePropertyValues(timeMillis: number): Map<string, FixturePropertyValue[]> {
    // Loop over all relevant presets and calc the property values from the presets (properties and effects)
    let calculatedFixtures = new Map<string, FixturePropertyValue[]>();
    let presets = this.getPresets(timeMillis);

    for (let fixtureIndex = 0; fixtureIndex < this.fixtureService.fixtures.length; fixtureIndex++) {
      let fixture = this.fixtureService.fixtures[fixtureIndex];
      
      // Only relevant for the 3d-preview
      // All properties of the current fixture
      let previewProperties: FixturePropertyValue[] = [];

      let alreadyCalculatedFixture = this.alreadyCalculatedFixture(this.fixtureService.fixtures, fixtureIndex);

      // Apply the fixture default channels
      previewProperties.concat(fixture.fixturePropertyValues);

      if (alreadyCalculatedFixture) {
        // Only relevant for the preview --> reuse all calculated values
        previewProperties.concat(calculatedFixtures.get(alreadyCalculatedFixture.uuid));
      } else {
        for (let preset of presets) {
          let fixtureIndex: number = undefined;

          // When fading is in progress (on preset or scene-level), the current preset does not
          // fully cover underlying values.
          // -> 0 = no covering at all, 1 = fully cover (no fading)
          let intensityPercentage: number = 1;

          if (preset.region && preset.scene) {
            // Fade out is stronger than fade in (if they overlap)

            // Take away intensity for scene fading
            if (timeMillis > preset.region.endMillis - preset.scene.fadeOutMillis) {
              // Scene fades out
              intensityPercentage -= (preset.region.endMillis - timeMillis) / preset.scene.fadeOutMillis;
            } else if(timeMillis < preset.region.startMillis + preset.scene.fadeInMillis) {
              // Scene fades in
              intensityPercentage -= (timeMillis - preset.region.startMillis) / preset.scene.fadeInMillis;
            }

            // Take away intensity for preset fading
            if (timeMillis > preset.region.startMillis + preset.preset.endMillis - preset.preset.fadeOutMillis) {
              // Preset fades out
              intensityPercentage -= (preset.region.startMillis + preset.preset.endMillis - timeMillis) / preset.preset.fadeOutMillis;
            } else if(timeMillis < preset.region.startMillis + preset.preset.startMillis + preset.preset.fadeInMillis) {
              // Preset fades in
              intensityPercentage -= (timeMillis - preset.region.startMillis + preset.preset.startMillis) / preset.preset.fadeInMillis;
            }

            intensityPercentage = Math.max(0, intensityPercentage);
          }

          // Search for this fixture in the preset and get it's preset-specific index (for chasing effects)
          for (let i = 0; i < preset.preset.fixtures.length; i++) {
            if (preset.preset.fixtures[i].uuid == fixture.uuid) {
              fixtureIndex = i;
              break;
            }
          }

          if (fixtureIndex) {
            // This fixture is also in the preset
            let template: FixtureTemplate = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
            let mode: FixtureMode = this.fixtureService.getModeByUuid(fixture.modeUuid, template);
            let universe: Universe = this.universeService.getUniverseByUuid(fixture.universeUuid);

            // Match all property values in this preset with the fixture properties
            for (let fixturePropertyIndex = 0; fixturePropertyIndex < mode.fixtureProperties.length; fixturePropertyIndex++) {
              for (let presetProperty of preset.preset.fixturePropertyValues) {
                if (mode.fixtureProperties[fixturePropertyIndex].type == presetProperty.fixturePropertyType) {
                  presetProperty.value = this.presetService.roundDmx(presetProperty.value);

                  this.setPropertyValue(universe, fixture.firstChannel + fixturePropertyIndex, previewProperties, presetProperty, intensityPercentage);
                }
              }
            }

            // Match all effect properties of this preset with the fixture properties
            for (let effect of preset.preset.effects) {
              let effectPropertyValues: FixturePropertyValue[] = [];
              let value = effect.getValueAtMillis(fixtureIndex);

              switch (+effect.effectChannel) {
                case EffectChannel.colorRed:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.colorRed, FixturePropertyType.colorRedFine));
                  break;
                case EffectChannel.colorGreen:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.colorGreen, FixturePropertyType.colorGreenFine));
                  break;
                case EffectChannel.colorBlue:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.colorBlue, FixturePropertyType.colorBlueFine));
                  break;
                case EffectChannel.pan:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.pan, FixturePropertyType.panFine));
                  break;
                case EffectChannel.tilt:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.tilt, FixturePropertyType.tiltFine));
                  break;
              }

              for (let fixturePropertyIndex = 0; fixturePropertyIndex < mode.fixtureProperties.length; fixturePropertyIndex++) {
                for (let effectProperty of effectPropertyValues) {
                  if (mode.fixtureProperties[fixturePropertyIndex].type == effectProperty.fixturePropertyType) {
                    this.setPropertyValue(universe, fixture.firstChannel + fixturePropertyIndex, previewProperties, effectProperty, intensityPercentage);
                  }
                }
              }
            }

            // Store the calculated values for subsequent fixtures on the same DMX address
            calculatedFixtures.set(fixture.uuid, previewProperties);
          }
        }
      }
    }

    return calculatedFixtures;
  }

}
