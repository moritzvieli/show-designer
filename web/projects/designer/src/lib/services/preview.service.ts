import { Injectable } from '@angular/core';
import { Universe } from '../models/universe';
import { PresetService } from './preset.service';
import { FixtureService } from './fixture.service';
import { SceneService } from './scene.service';
import { TimelineService } from './timeline.service';
import { UniverseService } from './universe.service';
import { FixtureCapabilityType } from '../models/fixture-capability';
import { Preset } from '../models/preset';
import { ProjectService } from './project.service';
import { PresetRegionScene } from '../models/preset-region-scene';
import { Subject } from 'rxjs';
import { FixtureChannelValue } from '../models/fixture-channel-value';
import { CachedFixture } from '../models/cached-fixture';

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

  private getAlreadyCalculatedFixture(fixtures: CachedFixture[], fixtureIndex: number): CachedFixture {
    // Has this fixture already been calculated (same universe and dmx start address as a fixture before)
    // --> return it
    for (let i = 0; i < fixtureIndex; i++) {
      let calculatedFixture = fixtures[i];

      if (calculatedFixture.fixture.dmxUniverseUuid == fixtures[fixtureIndex].fixture.dmxUniverseUuid
        && calculatedFixture.fixture.dmxFirstChannel == fixtures[fixtureIndex].fixture.dmxFirstChannel) {

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

  private mixChannelValue(existingChannelValues: FixtureChannelValue[], channelValue: FixtureChannelValue, intensityPercentage: number, defaultValue: number = 0) {
    let newValue: number = channelValue.value;
    let existingValue: number = defaultValue;

    if (intensityPercentage < 1) {
      // We need to mix a possibly existing value (or the default value 0) with the new value (fading)

      // Get the existant value for this property
      for (let existingChannelValue of existingChannelValues) {
        if (existingChannelValue.channelName == channelValue.channelName && existingChannelValue.fixtureTemplateUuid == channelValue.fixtureTemplateUuid) {
          existingValue = existingChannelValue.value;
          break;
        }
      }

      // Mix the existing value with the new value
      newValue = existingValue * (1 - intensityPercentage) + newValue * intensityPercentage;
    }

    // Remove the existant value, if available
    for (let i = 0; i < existingChannelValues.length; i++) {
      if (existingChannelValues[i].channelName == channelValue.channelName && existingChannelValues[i].fixtureTemplateUuid == channelValue.fixtureTemplateUuid) {
        existingChannelValues.splice(i, 1);
        break;
      }
    }

    // Add the new value
    let fixtureChannelValue = new FixtureChannelValue();
    fixtureChannelValue.channelName = channelValue.channelName;
    fixtureChannelValue.fixtureTemplateUuid = channelValue.fixtureTemplateUuid;
    fixtureChannelValue.value = newValue;
    existingChannelValues.push(fixtureChannelValue);
  }

  // Get the fixture index inside the passed preset (used for chasing)
  private getFixtureIndex(preset: Preset, fixtureUuid: string): number {
    let index = 0;
    let countedDmxChannels: number[] = [];

    // Loop over the global fixtures to retain the order
    for (let fixture of this.projectService.project.fixtures) {
      for (let presetFixtureUuid of preset.fixtureUuids) {
        if (presetFixtureUuid == fixture.uuid) {
          if (fixture.uuid == fixtureUuid) {
            return index;
          }

          // don't count fixtures on the same channel as already counted ones
          if (!countedDmxChannels.includes(fixture.dmxFirstChannel)) {
            countedDmxChannels.push(fixture.dmxFirstChannel);
            index++;
          }
          break;
        }
      }
    }

    // Not found in the preset
    return undefined;
  }

  private getPresetIntensity(preset: PresetRegionScene, timeMillis: number): number {
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

    return intensityPercentage;
  }

  private mixCapabilityValues(preset: PresetRegionScene, cachedFixture: CachedFixture, values: FixtureChannelValue[], intensityPercentage: number) {
    let hasColor: boolean = false;

    // mix the preset capability values
    for (let presetCapabilityValue of preset.preset.fixtureCapabilityValues) {
      for (let cachedChannel of cachedFixture.channels) {
        if (cachedChannel.fixtureChannel) {
          for (let channelCapability of cachedChannel.capabilities) {
            if (presetCapabilityValue.type == channelCapability.capability.type
              && (!presetCapabilityValue.color || presetCapabilityValue.color == channelCapability.capability.color)
              && (!presetCapabilityValue.wheel || (presetCapabilityValue.wheel == channelCapability.wheelName && presetCapabilityValue.fixtureTemplateUuid == cachedFixture.template.uuid))) {

              // the capabilities match -> apply the value, if possible
              if (presetCapabilityValue.valuePercentage >= 0 &&
                (presetCapabilityValue.type == FixtureCapabilityType.Intensity ||
                  presetCapabilityValue.type == FixtureCapabilityType.ColorIntensity)) {
                // intensity and colorIntensity (dimmer and color)
                let valuePercentage = presetCapabilityValue.valuePercentage;
                let defaultValue = 0;

                if (presetCapabilityValue.type == FixtureCapabilityType.Intensity) {
                  // the dimmer starts at full brightness
                  defaultValue = 255;
                }

                // brightness property
                if (cachedChannel.capabilities.length == 1) {
                  // the only capability in this channel
                  let fixtureChannelValue = new FixtureChannelValue();
                  fixtureChannelValue.channelName = cachedChannel.channelName;
                  fixtureChannelValue.fixtureTemplateUuid = cachedFixture.template.uuid;
                  fixtureChannelValue.value = cachedChannel.maxValue * valuePercentage;
                  this.mixChannelValue(values, fixtureChannelValue, intensityPercentage, defaultValue);

                  if (presetCapabilityValue.type == FixtureCapabilityType.ColorIntensity) {
                    hasColor = true;
                  }
                } else {
                  // more than one capability in the channel
                  if (channelCapability.capability.brightness == 'off' && valuePercentage == 0) {
                    let fixtureChannelValue = new FixtureChannelValue();
                    fixtureChannelValue.channelName = cachedChannel.channelName;
                    fixtureChannelValue.fixtureTemplateUuid = cachedFixture.template.uuid;
                    fixtureChannelValue.value = channelCapability.centerValue;
                    this.mixChannelValue(values, fixtureChannelValue, intensityPercentage, defaultValue);

                    if (presetCapabilityValue.type == FixtureCapabilityType.ColorIntensity) {
                      hasColor = true;
                    }
                  } else if ((channelCapability.capability.brightnessStart == 'dark' || channelCapability.capability.brightnessStart == 'off') && channelCapability.capability.brightnessEnd == 'bright') {
                    let value = (channelCapability.capability.dmxRange[1] - channelCapability.capability.dmxRange[0]) * valuePercentage + channelCapability.capability.dmxRange[0];
                    let fixtureChannelValue = new FixtureChannelValue();
                    fixtureChannelValue.channelName = cachedChannel.channelName;
                    fixtureChannelValue.fixtureTemplateUuid = cachedFixture.template.uuid;
                    fixtureChannelValue.value = value;
                    this.mixChannelValue(values, fixtureChannelValue, intensityPercentage, defaultValue);

                    if (presetCapabilityValue.type == FixtureCapabilityType.ColorIntensity) {
                      hasColor = true;
                    }
                  }
                }
              } else if (presetCapabilityValue.type == FixtureCapabilityType.WheelSlot
                && channelCapability.capability.slotNumber == presetCapabilityValue.slotNumber) {

                // wheel slot (color, gobo, etc.)
                let fixtureChannelValue = new FixtureChannelValue();
                fixtureChannelValue.channelName = cachedChannel.channelName;
                fixtureChannelValue.fixtureTemplateUuid = cachedFixture.template.uuid;
                fixtureChannelValue.value = channelCapability.centerValue;
                this.mixChannelValue(values, fixtureChannelValue, 1);

                // check, whether we just set a color wheel value
                if (channelCapability.wheelIsColor) {
                  hasColor = true;
                }
              }
            }
          }
        }

        // approximate the color from a color or a different color wheel, if necessary
        if (!hasColor && cachedChannel.colorWheel) {
          let capability = this.presetService.getApproximatedColorWheelCapability(preset.preset, cachedChannel);

          if (capability) {
            // we found an approximated color in the available wheel channel
            let fixtureChannelValue = new FixtureChannelValue();
            fixtureChannelValue.channelName = cachedChannel.channelName;
            fixtureChannelValue.fixtureTemplateUuid = cachedFixture.template.uuid;
            fixtureChannelValue.value = capability.centerValue;
            this.mixChannelValue(values, fixtureChannelValue, 1);
          }
        }
      }
    }
  }

  private mixChannelValues(preset: PresetRegionScene, cachedFixture: CachedFixture, values: FixtureChannelValue[], intensityPercentage: number) {
    // mix the preset channel values
    for (let cachedChannel of cachedFixture.channels) {
      if (cachedChannel.fixtureChannel) {
        for (let channelValue of preset.preset.fixtureChannelValues) {
          if (cachedFixture.template.uuid == channelValue.fixtureTemplateUuid && cachedChannel.channelName == channelValue.channelName) {
            this.mixChannelValue(values, channelValue, intensityPercentage);
          }
        }
      }
    }
  }

  private mixEffects(preset: PresetRegionScene, cachedFixture: CachedFixture, values: FixtureChannelValue[], intensityPercentage: number) {
    // TODO
    // Match all effect capabilities of this preset with the fixture capabilities
    // for (let effect of preset.preset.effects) {
    //   let effectChannelValues: FixtureChannelValue[] = [];
    //   let value = effect.getValueAtMillis(timeMillis, fixtureIndex);

    //   for (let effectChannel of effect.effectChannels) {
    //     switch (effectChannel) {
    //       case EffectChannel.dimmer:
    //         effectChannelValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.Intensity));
    //         break;
    //       case EffectChannel.pan:
    //         effectChannelValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.Pan));
    //         break;
    //       case EffectChannel.tilt:
    //         effectChannelValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.Tilt));
    //         break;
    //       case EffectChannel.colorRed:
    //         effectChannelValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Red));
    //         break;
    //       case EffectChannel.colorGreen:
    //         effectChannelValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Green));
    //         break;
    //       case EffectChannel.colorBlue:
    //         effectChannelValues.push(new FixtureCapabilityValue(value, FixtureCapabilityType.ColorIntensity, FixtureCapabilityColor.Blue));
    //         break;
    //     }
    //   }

    //   for (let channelFineIndex of channelFineIndices) {
    //     let channel = channelFineIndex.fixtureChannel;

    //     if (channel) {
    //       for (let effectChannelValue of effectChannelValues) {
    //         if (channel.capability.type == effectChannelValue.type) {
    //           this.mixChannelValue(values, effectChannelValue, intensityPercentage);
    //         }
    //       }
    //     }
    //   }
    // }
  }

  // return all fixture uuids with their corresponding channel values
  public getChannelValues(timeMillis: number, presets: PresetRegionScene[]): Map<CachedFixture, FixtureChannelValue[]> {
    // Loop over all relevant presets and calc the property values from the presets (capabilities and effects)
    let calculatedFixtures = new Map<CachedFixture, FixtureChannelValue[]>();

    for (let i = 0; i < this.fixtureService.cachedFixtures.length; i++) {
      let cachedFixture = this.fixtureService.cachedFixtures[i];

      // all values of the current fixture channels
      let values: FixtureChannelValue[] = [];

      let alreadyCalculatedFixture = this.getAlreadyCalculatedFixture(this.fixtureService.cachedFixtures, i);

      if (alreadyCalculatedFixture) {
        // only relevant for the preview --> reuse all calculated values
        values = Object.assign([], calculatedFixtures.get(alreadyCalculatedFixture));
      } else {
        // apply the default values
        for (let cachedChannel of cachedFixture.channels) {
          if (cachedChannel.fixtureChannel) {
            if (cachedChannel.fixtureChannel.defaultValue) {
              let fixtureChannelValue = new FixtureChannelValue();
              fixtureChannelValue.channelName = cachedChannel.channelName;
              fixtureChannelValue.fixtureTemplateUuid = cachedFixture.template.uuid;
              fixtureChannelValue.value = cachedChannel.defaultValue;
              this.mixChannelValue(values, fixtureChannelValue, 1);
            }
          }
        }

        for (let preset of presets) {
          // search for this fixture in the preset and get it's preset-specific index (for chasing effects)
          let fixtureIndex = this.getFixtureIndex(preset.preset, cachedFixture.fixture.uuid);

          if (fixtureIndex >= 0) {
            // this fixture is also in the preset -> mix the required values (overwrite existing values,
            // if set multiple times)
            let intensityPercentage = this.getPresetIntensity(preset, timeMillis);

            this.mixCapabilityValues(preset, cachedFixture, values, intensityPercentage);
            this.mixChannelValues(preset, cachedFixture, values, intensityPercentage);
            this.mixEffects(preset, cachedFixture, values, intensityPercentage);
          }
        }
      }

      // Store the calculated values for subsequent fixtures on the same DMX address
      calculatedFixtures.set(cachedFixture, values);
    }

    return calculatedFixtures;
  }

  private getDmxValue(value: number, fineValueCount: number, fineIndex: number): number {
    // return the rounded dmx value in the specified fineness
    if (fineIndex >= 0) {
      // a finer value is requested. calculate it by substracting the value
      // which has been returned on the current level.
      return this.getDmxValue((value - Math.floor(value)) * 255, fineValueCount - 1, fineIndex - 1);
    } else {
      // we reached the required fineness of the value
      if (fineValueCount > fineIndex + 1) {
        // there are finer values still available -> floor the current value
        return Math.floor(value);
      } else {
        // there are no finer values available -> round it
        return Math.round(value);
      }
    }
  }

  public setUniverseValues(fixtures: Map<CachedFixture, FixtureChannelValue[]>, masterDimmerValue: number) {
    // Reset all DMX universes
    for (let universe of this.universeService.universes) {
      universe.channelValues = [];
      for (let i = 0; i < 512; i++) {
        universe.channelValues.push(0);
      }
    }

    // loop over each fixture
    fixtures.forEach((channelValues: FixtureChannelValue[], cachedFixture: CachedFixture) => {
      // TODO Get the correct universe for this fixture
      let universe: Universe = this.universeService.getUniverseByUuid(cachedFixture.fixture.dmxUniverseUuid);

      // loop over each channel for this fixture
      for (let channelIndex = 0; channelIndex < cachedFixture.channels.length; channelIndex++) {
        let cachedChannel = cachedFixture.channels[channelIndex];

        if (cachedChannel.fixtureChannel) {
          // loop over each channel value
          for (let channelValue of channelValues) {
            // match the channel value with the fixture channel
            if (cachedChannel.channelName == channelValue.channelName) {
              let universeChannel = cachedFixture.fixture.dmxFirstChannel + channelIndex;

              // TODO
              let value = channelValue.value;
              // let value = this.getDmxValue(capability.value, channelFineIndices[channelIndex].fineValueCount, channelFineIndices[channelIndex].fineIndex);
            }
          }
        }
      }
    });
  }

  public fixtureIsSelected(uuid: string, presets: PresetRegionScene[]): boolean {
    for (let preset of presets) {
      for (let fixtureUuid of preset.preset.fixtureUuids) {
        if (fixtureUuid == uuid) {
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
