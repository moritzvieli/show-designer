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
import { ProjectService } from './project.service';
import { PresetRegionScene } from '../models/preset-region-scene';
import { Subject } from 'rxjs';
import { FixtureChannelValue } from '../models/fixture-channel-value';

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

  private mixChannelValue(existingChannelValues: FixtureChannelValue[], channelValue: FixtureChannelValue, intensityPercentage: number) {
    let newValue: number = channelValue.value;
    let existingValue: number = 0;

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
    existingChannelValues.push(new FixtureChannelValue(channelValue.channelName, channelValue.fixtureTemplateUuid, newValue));
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

  // return all fixture uuids with their corresponding channel values
  public getChannelValues(timeMillis: number, presets: PresetRegionScene[]): Map<string, FixtureChannelValue[]> {
    // Loop over all relevant presets and calc the property values from the presets (capabilities and effects)
    let calculatedFixtures = new Map<string, FixtureChannelValue[]>();

    for (let i = 0; i < this.projectService.project.fixtures.length; i++) {
      let fixture = this.projectService.project.fixtures[i];

      // all values of the current fixture channels
      let values: FixtureChannelValue[] = [];

      let alreadyCalculatedFixture = this.getAlreadyCalculatedFixture(this.projectService.project.fixtures, i);

      if (alreadyCalculatedFixture) {
        // only relevant for the preview --> reuse all calculated values
        values = Object.assign([], calculatedFixtures.get(alreadyCalculatedFixture.uuid));
      } else {
        let channelFineIndices = this.fixtureService.getChannelsByFixture(fixture);

        // apply the default channels
        for (let channelFineIndex of channelFineIndices) {
          let channel = channelFineIndex.fixtureChannel;

          if (channel) {
            let defaultValue = this.fixtureService.getDefaultValueByChannel(channel);

            if (defaultValue) {
              this.mixChannelValue(values, new FixtureChannelValue(channelFineIndex.channelName, channelFineIndex.fixtureTemplate.uuid, defaultValue), 1);
            }
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
            // this fixture is also in the preset
            let template = this.fixtureService.getTemplateByFixture(fixture);

            // mix the preset capability values
            for (let channelFineIndex of channelFineIndices) {
              let channel = channelFineIndex.fixtureChannel;

              if (channel) {
                let channelCapabilities = this.fixtureService.getCapabilitiesByChannel(channel);

                for (let presetCapabilityValue of preset.preset.fixtureCapabilityValues) {
                  for (let channelCapability of channelCapabilities) {
                    if (presetCapabilityValue.type == channelCapability.type &&
                      (!presetCapabilityValue.color || presetCapabilityValue.color == channelCapability.color)) {

                      // the capabilities match -> apply the value, if possible
                      if (presetCapabilityValue.valuePercentage && 
                        (presetCapabilityValue.type == FixtureCapabilityType.Intensity ||
                        presetCapabilityValue.type == FixtureCapabilityType.ColorIntensity)) {

                        let valuePercentage = presetCapabilityValue.valuePercentage;

                        // brightness property
                        if (channelCapabilities.length == 1) {
                          // the only capability in this channel
                          let channelValue = new FixtureChannelValue(channelFineIndex.channelName, template.uuid, this.fixtureService.getMaxValueByChannel(channel) * valuePercentage);
                          this.mixChannelValue(values, channelValue, intensityPercentage);
                        } else {
                          // more than one capability in the channel
                          if(channelCapability.brightness == 'off' && valuePercentage == 0) {
                            let channelValue = new FixtureChannelValue(channelFineIndex.channelName, template.uuid, Math.floor((channelCapability.dmxRange[0] + channelCapability.dmxRange[1]) / 2));
                            this.mixChannelValue(values, channelValue, intensityPercentage);
                          } else if ((channelCapability.brightnessStart == 'dark' || channelCapability.brightnessStart == 'off') && channelCapability.brightnessEnd == 'bright') {
                            let value = (channelCapability.dmxRange[1] - channelCapability.dmxRange[0]) * valuePercentage + channelCapability.dmxRange[0];
                            let channelValue = new FixtureChannelValue(channelFineIndex.channelName, template.uuid, value);
                            this.mixChannelValue(values, channelValue, intensityPercentage);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            // mix the preset wheels
            for (let channelFineIndex of channelFineIndices) {
              let channel = channelFineIndex.fixtureChannel;

              if (channel) {
                let channelCapabilities = this.fixtureService.getCapabilitiesByChannel(channel);



                // TODO

                // approximate the color wheel, if a color capability is set or a different color wheel
                // this.presetService.getApproximatedColorWheelSlotIndex
              }
            }

            // mix the preset channel values (overwrite the capabilities, if necessary)
            for (let channelFineIndex of channelFineIndices) {
              let channel = channelFineIndex.fixtureChannel;

              if (channel) {
                for (let channelValue of preset.preset.fixtureChannelValues) {
                  if (template.uuid == channelValue.fixtureTemplateUuid && channelFineIndex.channelName == channelValue.channelName) {
                    this.mixChannelValue(values, channelValue, intensityPercentage);
                  }
                }
              }
            }

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
        }
      }

      // Store the calculated values for subsequent fixtures on the same DMX address
      calculatedFixtures.set(fixture.uuid, values);
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

  public setUniverseValues(fixtures: Map<string, FixtureChannelValue[]>, masterDimmerValue: number) {
    // Reset all DMX universes
    for (let universe of this.universeService.universes) {
      universe.channelValues = [];
      for (let i = 0; i < 512; i++) {
        universe.channelValues.push(0);
      }
    }

    fixtures.forEach((channelValues: FixtureChannelValue[], fixtureUuid: string) => {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);

      // TODO Get the correct universe for this fixture
      let universe: Universe = this.universeService.getUniverseByUuid(fixture.dmxUniverseUuid);

      let template: FixtureTemplate = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
      let channelFineIndices = this.fixtureService.getChannelsByFixture(fixture);

      for (let channelIndex = 0; channelIndex < channelFineIndices.length; channelIndex++) {
        let channel = channelFineIndices[channelIndex].fixtureChannel;

        // TODO
        // for (let channelValue of channelValues) {
        //   if (channel && channel.capability.type == capability.type) {
        //     let universeChannel = fixture.dmxFirstChannel + channelIndex;
        //     let value = this.getDmxValue(capability.value, channelFineIndices[channelIndex].fineValueCount, channelFineIndices[channelIndex].fineIndex);

        //     //universe.getUniverse().put(universeChannel, value);

        //     // TODO Set the fine properties, if available

        //     // TODO apply the master dimmer value to dimmer channels
        //   }
        // }
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
