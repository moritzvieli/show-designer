import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { PresetService } from '../../services/preset.service';
import { FixtureService } from '../../services/fixture.service';
import { FixtureProfile } from '../../models/fixture-profile';
import { FixtureWheelSlotType } from '../../models/fixture-wheel-slot';
import { CachedFixtureChannel } from '../../models/cached-fixture-channel';
import { ProjectService } from '../../services/project.service';
import { IntroService } from '../../services/intro.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FixtureCapabilityComponent implements OnInit, OnDestroy {

  // map containing the profile and the channel name containing the wheel
  colorWheelChannels: Map<FixtureProfile, CachedFixtureChannel> = new Map<FixtureProfile, CachedFixtureChannel>();

  private fixtureSelectionChangedSubscription: Subscription;
  private previewSelectionChangedSubscription: Subscription;

  constructor(
    public presetService: PresetService,
    private fixtureService: FixtureService,
    private changeDetectorRef: ChangeDetectorRef,
    public projectService: ProjectService,
    public introService: IntroService
  ) {
    this.fixtureSelectionChangedSubscription = this.presetService.fixtureSelectionChanged.subscribe(() => {
      this.update();
    });

    this.previewSelectionChangedSubscription = this.presetService.previewSelectionChanged.subscribe(() => {
      this.update();
    });

    this.introService.stepChanged.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.fixtureSelectionChangedSubscription.unsubscribe();
    this.previewSelectionChangedSubscription.unsubscribe();
  }

  private wheelInList(wheels: Map<FixtureProfile, CachedFixtureChannel>, profile: FixtureProfile, channel: CachedFixtureChannel) {
    wheels.forEach((existingChannel: CachedFixtureChannel, existingProfile: FixtureProfile) => {
      if (existingProfile.uuid === profile.uuid && existingChannel.name === channel.name) {
        return true;
      }
    });

    return false;
  }

  private updateColorWheels() {
    this.colorWheelChannels = new Map<FixtureProfile, CachedFixtureChannel>();

    if (!this.presetService.selectedPreset) {
      return;
    }

    for (const fixtureUuid of this.presetService.selectedPreset.fixtureUuids) {
      const fixture = this.fixtureService.getCachedFixtureByUuid(fixtureUuid);
      for (const channel of fixture.channels) {
        for (const capability of channel.capabilities) {
          if (capability.wheel && capability.wheelSlots && capability.wheelSlots.length > 0) {
            if (this.fixtureService.wheelHasSlotType(capability.wheel, FixtureWheelSlotType.Color)) {
              // color wheel
              if (!this.wheelInList(this.colorWheelChannels, fixture.profile, channel)) {
                this.colorWheelChannels.set(fixture.profile, channel);
              }
            } else if (this.fixtureService.wheelHasSlotType(capability.wheel, FixtureWheelSlotType.Gobo)) {
              // gobo wheel
              // TODO
            }
          }
        }
      }
    }
  }

  private update() {
    this.updateColorWheels();
    this.changeDetectorRef.detectChanges();
  }

  isChrome(): boolean {
    if (navigator.appVersion.indexOf('Chrome/') !== -1) {
      return true;
    }
    return false;
  }

}
