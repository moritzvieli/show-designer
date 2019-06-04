import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureService } from '../../services/fixture.service';
import { FixtureTemplate } from '../../models/fixture-template';
import { FixtureChannelFineIndex } from '../../models/fixture-channel-fine-index';
import { FixtureMode } from '../../models/fixture-mode';

@Component({
  selector: 'app-fixture-channel',
  templateUrl: './fixture-channel.component.html',
  styleUrls: ['./fixture-channel.component.css']
})
export class FixtureChannelComponent implements OnInit {

  public channelCapabilities: FixtureChannelFineIndex[] = [];
  public templates: FixtureTemplate[] = [];
  public selectedTemplates: FixtureTemplate[] = [];

  constructor(
    public presetService: PresetService,
    private fixtureService: FixtureService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.presetService.fixtureSelectionChanged.subscribe(() => {
      this.calculateTemplates();
    });

    this.presetService.previewSelectionChanged.subscribe(() => {
      this.calculateTemplates();
    });
  }

  ngOnInit() {
  }

  private calculateChannelCapabilities() {
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
    this.channelCapabilities = [];
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
      this.channelCapabilities = this.channelCapabilities.concat(templateChannels);
    });

    this.changeDetectorRef.detectChanges();
  }

  private calculateTemplates() {
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

    this.calculateChannelCapabilities();
  }

  changeTemplateSelection($event: any, template: FixtureTemplate) {
    if (this.selectedTemplates.indexOf(template) >= 0) {
      this.selectedTemplates.splice(this.selectedTemplates.indexOf(template), 1);
    } else {
      this.selectedTemplates.push(template);
    }

    this.calculateChannelCapabilities();
  }

  isChrome(): boolean {
    if (navigator.appVersion.indexOf("Chrome/") != -1) {
      return true;
    }
    return false;
  }

}
