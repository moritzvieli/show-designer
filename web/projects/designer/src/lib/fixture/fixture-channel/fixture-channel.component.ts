import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureProfile } from '../../models/fixture-profile';
import { CachedFixtureChannel } from '../../models/cached-fixture-channel';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-fixture-channel',
  templateUrl: './fixture-channel.component.html',
  styleUrls: ['./fixture-channel.component.css']
})
export class FixtureChannelComponent implements OnInit {

  public channelCapabilities: Map<FixtureProfile, CachedFixtureChannel[]> = new Map<FixtureProfile, CachedFixtureChannel[]>();
  public profiles: FixtureProfile[] = [];
  public selectedProfiles: FixtureProfile[] = [];

  constructor(
    public presetService: PresetService,
    private changeDetectorRef: ChangeDetectorRef,
    public projectService: ProjectService
  ) {
    this.presetService.fixtureSelectionChanged.subscribe(() => {
      this.calculateProfiles();
    });

    this.presetService.previewSelectionChanged.subscribe(() => {
      this.calculateProfiles();
    });
  }

  ngOnInit() {
  }

  private calculateChannelCapabilities() {
    this.channelCapabilities = this.presetService.getSelectedProfileChannels(this.selectedProfiles);

    this.changeDetectorRef.detectChanges();
  }

  private calculateProfiles() {
    // calculate all profiels
    this.profiles = this.presetService.getSelectedProfiles();

    // select all profiles by default
    this.selectedProfiles = [...this.profiles];

    this.calculateChannelCapabilities();
  }

  changeProfileSelection($event: any, profile: FixtureProfile) {
    if (this.selectedProfiles.indexOf(profile) >= 0) {
      this.selectedProfiles.splice(this.selectedProfiles.indexOf(profile), 1);
    } else {
      this.selectedProfiles.push(profile);
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
