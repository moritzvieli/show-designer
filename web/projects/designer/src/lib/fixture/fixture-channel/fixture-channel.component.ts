import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureService } from '../../services/fixture.service';
import { FixtureTemplate } from '../../models/fixture-template';
import { FixtureMode } from '../../models/fixture-mode';
import { CachedFixtureChannel } from '../../models/cached-fixture-channel';

@Component({
  selector: 'app-fixture-channel',
  templateUrl: './fixture-channel.component.html',
  styleUrls: ['./fixture-channel.component.css']
})
export class FixtureChannelComponent implements OnInit {

  public channelCapabilities: Map<FixtureTemplate, CachedFixtureChannel[]> = new Map<FixtureTemplate, CachedFixtureChannel[]>();
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
    this.channelCapabilities = this.presetService.getSelectedTemplateChannels(this.selectedTemplates);

    this.changeDetectorRef.detectChanges();
  }

  private calculateTemplates() {
    // calculate all templates
    this.templates = this.presetService.getSelectedTemplates();

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
