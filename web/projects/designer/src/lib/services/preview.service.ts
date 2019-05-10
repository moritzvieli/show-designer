import { Injectable } from '@angular/core';
import { Universe } from '../models/universe';
import { Fixture } from '../models/fixture';
import { PresetService } from './preset.service';
import { FixtureService } from './fixture.service';
import { SceneService } from './scene.service';
import { TimelineService } from './timeline.service';
import { UniverseService } from './universe.service';
import { FixtureTemplate } from '../models/fixture-template';
import { EffectChannel } from '../models/effect';
import { FixtureCapabilityValue } from '../models/fixture-capability-value';
import { FixtureCapabilityType, FixtureCapabilityColor } from '../models/fixture-capability';
import { Preset } from '../models/preset';
import { FixtureChannel } from '../models/fixture-channel';
import { ProjectService } from './project.service';
import { PresetRegionScene } from '../models/preset-region-scene';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  public doUpdateFixtureSetup: Subject<void> = new Subject();

  constructor(
    private presetService: PresetService,
    private fixtureService: FixtureService,
    private sceneService: SceneService,
    private timelineService: TimelineService,
    private universeService: UniverseService,
    private projectService: ProjectService
  ) { }

  private getAlreadyCalculatedFixture(fixtures: Fixture[], fixtureIndex: number): Fixture {
    // Has this fixture already been calculated (same universe and dmx start address as a fixture before)
    // --> return it
    for (let i = 0; i < fixtureIndex; i++) {
      let calculatedFixture = fixtures[i];

      if (calculatedFixture.dmxUniverseUuid == fixtures[fixtureIndex].dmxUniverseUuid
        && calculatedFixture.dmxFirstChannel == fixtures[fixtureIndex].dmxFirstChannel) {

        return calculatedFixture;
      }
    }

    return undefined;
  }

  public getPresets(timeMillis: number): PresetRegionScene[] {
    // Get relevant presets in correct order to process with their corresponding scene, if available
    let presets: PresetRegionScene[] = [];

    if (this.timelineService.playState == 'playing') {
      // Only use active presets in current regions
      presets = this.timelineService.getPresetsInTime(timeMillis);
    } else {
      if (this.presetService.previewPreset) {
        // Only preview the selected preset
        if (this.presetService.selectedPreset) {
          presets.push(new PresetRegionScene(this.presetService.selectedPreset, undefined, undefined));
        }
      } else {
        // Preview the selected scenes
        for (let sceneIndex = this.projectService.project.scenes.length - 1; sceneIndex >= 0; sceneIndex--) {
          for (let scene of this.sceneService.selectedScenes) {
            if (scene.uuid == this.projectService.project.scenes[sceneIndex].uuid) {
              for (let presetIndex = this.projectService.project.presets.length - 1; presetIndex >= 0; presetIndex--) {
                for (let presetUuid of scene.presetUuids) {
                  // Loop over the presets in the preset service to retain the preset order
                  if (presetUuid == this.projectService.project.presets[presetIndex].uuid) {
                    presets.push(new PresetRegionScene(this.projectService.project.presets[presetIndex], undefined, scene));
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    return presets;
  }

  private capabilityValuesEqual(capability1: FixtureCapabilityValue, capbability2: FixtureCapabilityValue): boolean {
    return capability1.type == capbability2.type
      && (!capability1.color || capbability2.color == capability1.color);
  }

  private mixCapabilityValue(existingCapabilityValues: FixtureCapabilityValue[], capabilityValue: FixtureCapabilityValue, intensityPercentage: number) {
    let newValue: number = capabilityValue.value;
    let existingValue: number = 0;

    if (intensityPercentage < 1) {
      // We need to mix a possibly existing value (or the default value 0) with the new value (fading)

      // Get the existant value for this property
      for (let existingCapabilityValue of existingCapabilityValues) {
        if (this.capabilityValuesEqual(existingCapabilityValue, capabilityValue)) {
          existingValue = existingCapabilityValue.value;
          break;
        }
      }

      // Mix the existing value with the new value
      newValue = existingValue * (1 - intensityPercentage) + newValue * intensityPercentage;
    }

    // Remove the existant value, if available
    for (let i = 0; i < existingCapabilityValues.length; i++) {
      if (this.capabilityValuesEqual(existingCapabilityValues[i], capabilityValue)) {
        existingCapabilityValues.splice(i, 1);
        break;
      }
    }

    // Add the new value
    existingCapabilityValues.push(new FixtureCapabilityValue(newValue, capabilityValue.type, capabilityValue.color));
  }

  // Get the fixture index inside the passed preset (used for chasing)
  private getFixtureIndex(preset: Preset, fixtureUuid: string): number {
    let index = 0;

    // Loop over the global fixtures to retain the order
    for (let fixture of this.projectService.project.fixtures) {
      for (let presetFixture of preset.fixtures) {
        if (presetFixture.uuid == fixture.uuid) {
          if (fixture.uuid == fixtureUuid) {
            return index;
          }

          index++;
          break;
        }
      }
    }

    // Not found in the preset
    return undefined;
  }

  public getFixturePropertyValues(timeMillis: number, presets: PresetRegionScene[]): Map<string, FixtureCapabilityValue[]> {
    // Loop over all relevant presets and calc the property values from the presets (capabilities and effects)
    let calculatedFixtures = new Map<string, FixtureCapabilityValue[]>();

    for (let i = 0; i < this.projectService.project.fixtures.length; i++) {
      let fixture = this.projectService.project.fixtures[i];

      // All capabilities of the current fixture
      let capabilities: FixtureCapabilityValue[] = [];

      let alreadyCalculatedFixture = this.getAlreadyCalculatedFixture(this.projectService.project.fixtures, i);

      if (alreadyCalculatedFixture) {
        // Only relevant for the preview --> reuse all calculated values
        capabilities = Object.assign([], calculatedFixtures.get(alreadyCalculatedFixture.uuid));
      } else {
        let channels = this.fixtureService.getChannelsByFixture(fixture);

        // Apply the fixture default channels
        for (let channel of channels) {
          if (channel && channel.defaultValue) {
            let type = channel.capability.type;
            let value = 0;

            if (isNaN(<any>channel.defaultValue) && (<string>channel.defaultValue).endsWith('%')) {
              // Percentage value
              let percentage = Number.parseInt((<string>channel.defaultValue).replace('%', ''));
              value = 255 / 100 * percentage;
            } else {
              // DMX value
              value = Number.parseInt(<any>channel.defaultValue);
            }

            this.mixCapabilityValue(capabilities, new FixtureCapabilityValue(value, type, channel.capability.color), 1);
          }
        }

        for (let preset of presets) {
          // When fading is in progress (on preset or scene-level), the current preset does not
          // fully cover underlying values.
          // -> 0 = no covering at all, 1 = fully cover (no fading)
          let intensityPercentageScene: number = 1;
          let intensityPercentagePreset: number = 1;
          let intensityPercentage: number = 1;

          if (preset.region && preset.scene) {
            // Fade out is stronger than fade in (if they overlap)

            // Take away intensity for scene fading
            if (timeMillis > preset.region.endMillis - preset.scene.fadeOutMillis) {
              // Scene fades out
              intensityPercentageScene = (preset.region.endMillis - timeMillis) / preset.scene.fadeOutMillis;
            } else if (timeMillis < preset.region.startMillis + preset.scene.fadeInMillis) {
              // Scene fades in
              intensityPercentageScene = (timeMillis - preset.region.startMillis) / preset.scene.fadeInMillis;
            }
          }

          if (preset.region && preset.preset) {
            // Take away intensity for preset fading
            if (preset.preset.endMillis && timeMillis > preset.region.startMillis + preset.preset.endMillis - preset.preset.fadeOutMillis) {
              // Preset fades out
              intensityPercentagePreset = (preset.region.startMillis + preset.preset.endMillis - timeMillis) / preset.preset.fadeOutMillis;
            }
            
            if (preset.preset.startMillis && timeMillis < preset.region.startMillis + preset.preset.startMillis + preset.preset.fadeInMillis) {
              // Preset fades in
              intensityPercentagePreset = (timeMillis - preset.region.startMillis + preset.preset.startMillis) / preset.preset.fadeInMillis;
            }

            // If the preset and the scene, both are fading, take the stronger
            intensityPercentage = Math.min(intensityPercentageScene, intensityPercentagePreset);
          }

          // Search for this fixture in the preset and get it's preset-specific index (for chasing effects)
          let fixtureIndex = this.getFixtureIndex(preset.preset, fixture.uuid);

          if (fixtureIndex >= 0) {
            // This fixture is also in the preset

            // Match all capability values in this preset with the fixture capabilities
            for (let channel of channels) {
              for (let presetCapability of preset.preset.capabilityValues) {
                if (channel && channel.capability.type == presetCapability.type) {
                  this.mixCapabilityValue(capabilities, presetCapability, intensityPercentage);
                }
              }
            }

            // Match all effect capabilities of this preset with the fixture capabilities
            for (let effect of preset.preset.effects) {
              let effectCapabilityValues: FixtureCapabilityValue[] = [];
              let value = effect.getValueAtMillis(timeMillis, fixtureIndex);

              for (let effectChannel of effect.effectChannels) {
                switch (effectChannel) {
                  case EffectChannel.dimmer:
                    effectCapabilityValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.Intensity));
                    break;
                  case EffectChannel.pan:
                    effectCapabilityValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.Pan));
                    break;
                  case EffectChannel.tilt:
                    effectCapabilityValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.Tilt));
                    break;
                  case EffectChannel.colorRed:
                    effectCapabilityValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Red));
                    break;
                  case EffectChannel.colorGreen:
                    effectCapabilityValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Green));
                    break;
                  case EffectChannel.colorBlue:
                    effectCapabilityValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Blue));
                    break;
                }
              }

              for (let channel of channels) {
                for (let effectCapability of effectCapabilityValues) {
                  if (channel.capability.type == effectCapability.type) {
                    this.mixCapabilityValue(capabilities, effectCapability, intensityPercentage);
                  }
                }
              }
            }
          }
        }
      }

      // Store the calculated values for subsequent fixtures on the same DMX address
      calculatedFixtures.set(fixture.uuid, capabilities);
    }

    return calculatedFixtures;
  }

  public setUniverseValues(values: Map<string, FixtureCapabilityValue[]>, masterDimmerValue: number) {
    // Reset all DMX universes
    for (let universe of this.universeService.universes) {
      universe.channelValues = [];
      for (let i = 0; i < 512; i++) {
        universe.channelValues.push(0);
      }
    }

    values.forEach((capabilities: FixtureCapabilityValue[], fixtureUuid: string) => {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let universe: Universe = this.universeService.getUniverseByUuid(fixture.dmxUniverseUuid);
      let template: FixtureTemplate = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
      let channels = this.fixtureService.getChannelsByFixture(fixture);

      for (let channelIndex = 0; channelIndex < channels.length; channelIndex++) {
        let channel = channels[channelIndex];

        for (let capability of capabilities) {
          if (channel && channel.capability.type == capability.type) {
            // TODO Round the DMX value and set fine property, if available

            // TODO Set universe channel fixture.firstChannel + fixturePropertyIndex to property.value

            // TODO apply the master dimmer value to dimmer channels
          }
        }
      }
    });
  }

  public fixtureIsSelected(uuid: string, presets: PresetRegionScene[]): boolean {
    for (let preset of presets) {
      for (let fixture of preset.preset.fixtures) {
        if (fixture.uuid == uuid) {
          return true;
        }
      }
    }

    return false;
  }

  public updateFixtureSetup() {
    this.doUpdateFixtureSetup.next();
  }

}
