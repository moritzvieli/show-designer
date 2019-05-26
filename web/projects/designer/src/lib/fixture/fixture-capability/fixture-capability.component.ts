import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureCapabilityType } from '../../models/fixture-capability';
import { FixtureService } from '../../services/fixture.service';
import { FixtureChannelFineIndex } from '../../models/fixture-channel-fine-index';
import { FixtureTemplate } from '../../models/fixture-template';
import { FixtureMode } from '../../models/fixture-mode';
import { truncate } from 'fs';

@Component({
  selector: 'app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityComponent implements OnInit {

  public genericChannels: FixtureChannelFineIndex[] = [];
  public templates: FixtureTemplate[] = [];
  public selectedTemplates: FixtureTemplate[] = [];

  constructor(
    private presetService: PresetService,
    private fixtureService: FixtureService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.presetService.fixtureSelectionChanged.subscribe(() => {
      // calculate all templates
      this.templates = [];
      for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
        let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
        let template = this.fixtureService.getTemplateByFixture(fixture);

        if (this.templates.indexOf(template) < 0) {
          this.templates.push(template);
        }
      }

      // select all templates by default
      this.selectedTemplates = [...this.templates];

      this.calculateGenericChannels();
    });
  }

  ngOnInit() {
  }

  private calculateGenericChannels() {
    // calculate all required modes to the templates
    let calculatedTemplateModes = new Map<FixtureTemplate, FixtureMode[]>();
    for (let template of this.selectedTemplates) {
      let modes: FixtureMode[] = [];
      for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
        let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
        let mode = this.fixtureService.getModeByFixture(fixture);
        if (modes.indexOf(mode) < 0) {
          modes.push(mode);
        }
      }
      calculatedTemplateModes.set(template, modes);
    }

    // calculate all required channels from the modes
    this.genericChannels = [];
    calculatedTemplateModes.forEach((modes: FixtureMode[], template: FixtureTemplate) => {
      let templateChannels: FixtureChannelFineIndex[] = [];
      for (let mode of modes) {
        let channels = this.fixtureService.getChannelsByTemplateMode(template, mode);
        for (let channel of channels) {
          // only add the channel, if no channel with the same name has already been added
          // (e.g. a fine channel)
          if (channel.fixtureChannel && !templateChannels.find(c => c.channelName == channel.channelName)) {
            templateChannels.push(channel);
          }
        }
      }
      this.genericChannels = this.genericChannels.concat(templateChannels);
    });

    this.changeDetectorRef.detectChanges();
  }

  //   showCapability(type: FixtureCapabilityType, channelName?: string): boolean {
  //     // has at least one fixture of the selected preset the required capability
  //     for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
  //       let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
  //       let channels = this.fixtureService.getChannelsByFixture(fixture);
  // console.log(channels);
  //       for (let channelFineIndex of channels) {
  //         if (channelFineIndex.fixtureChannel) {
  //           if(this.fixtureService.channelHasCapabilityType(channelFineIndex.fixtureChannel, type) && (!channelName || channelFineIndex.channelName == channelName)) {
  //             return true;
  //           }
  //         }
  //       }
  //     }
  //     return false;
  //   }

  showDimmer(): boolean {
    // there is at least one channel with at least one intensity capability
    for (let fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      let fixture = this.fixtureService.getFixtureByUuid(fixtureUuid);
      let channels = this.fixtureService.getChannelsByFixture(fixture);
      for (let channelFineIndex of channels) {
        if (channelFineIndex.fixtureChannel) {
          if (this.fixtureService.channelHasCapabilityType(channelFineIndex.fixtureChannel, FixtureCapabilityType.Intensity)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  showColor(): boolean {
    // TODO there is at least one channel for each color, r, g and b
    // TODO optionally color temperature and color white (see stairville/mh-100)
    return false;
  }

  showPanTilt(): boolean {
    // TODO there is at least one pan and one tilt channel
    // TODO optionally endless pan/tilt and movement speed
    return false;
  }

  changeTemplateSelection($event: any, template: FixtureTemplate) {
    if (this.selectedTemplates.indexOf(template) >= 0) {
      this.selectedTemplates.splice(this.selectedTemplates.indexOf(template), 1);
    } else {
      this.selectedTemplates.push(template);
    }

    this.calculateGenericChannels();
  }

  isChrome(): boolean {
    if (navigator.appVersion.indexOf("Chrome/") != -1) {
      return true;
    }
    return false;
  }

}
