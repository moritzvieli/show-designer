import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FixtureProfile, FixtureCategory } from '../models/fixture-profile';
import { FixtureService } from '../services/fixture.service';
import { Fixture } from '../models/fixture';
import { UuidService } from '../services/uuid.service';
import { ProjectService } from '../services/project.service';
import { Subject } from 'rxjs';
import { PreviewService } from '../services/preview.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PresetService } from '../services/preset.service';
import { catchError, finalize } from 'rxjs/operators';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-fixture-pool',
  templateUrl: './fixture-pool.component.html',
  styleUrls: ['./fixture-pool.component.css']
})
export class FixturePoolComponent implements OnInit {

  private profiles: FixtureProfile[];
  public filteredProfiles: FixtureProfile[];
  public loadingProfiles: boolean = false;

  public fixturePool: Fixture[];

  public dmxChannels: number[] = [];
  public selectedFixture: Fixture;
  public selectedFixtureProfile: FixtureProfile;
  public showChannelNumbers: boolean = false;
  public channelDragFixture: Fixture;
  public channelDragOffset: number;

  public onClose: Subject<number> = new Subject();

  private lastAddedFixture: Fixture;

  public updatingProfiles: boolean;

  constructor(
    public bsModalRef: BsModalRef,
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    public projectService: ProjectService,
    private previewService: PreviewService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private presetService: PresetService,
    public configService: ConfigService
  ) {
    this.fixturePool = [...this.projectService.project.fixtures];

    if (this.fixturePool.length > 0) {
      this.selectFixture(this.fixturePool[0]);
    }
  }

  ngOnInit() {
    for (let i = 0; i < 512; i++) {
      this.dmxChannels.push(0);
    }

    this.loadProfiles();
  }

  private loadProfiles() {
    this.loadingProfiles = true;

    this.fixtureService.getSearchProfiles().subscribe(profiles => {
      this.profiles = profiles;
      this.filterProfiles();
      this.loadingProfiles = false;
    });
  }

  selectFixture(fixture: Fixture) {
    this.selectedFixtureProfile = undefined;
    if (fixture) {
      this.selectedFixtureProfile = this.fixtureService.getProfileByUuid(fixture.profileUuid);
    }
    this.selectedFixture = fixture;
  }

  filterProfiles(searchValue?: string) {
    if (!searchValue) {
      this.filteredProfiles = this.profiles;
      return;
    }

    this.filteredProfiles = [];

    for (let profile of this.profiles) {
      if (profile.uuid.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
        || profile.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
        || profile.manufacturerName.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {

        this.filteredProfiles.push(profile);
      }
    }
  }

  private getNextFreeDmxChannel(neededChannels: number): number {
    // get the next free space for this fixture
    let freeChannels = 0;

    for (let i = 0; i < 512; i++) {
      let occupiedChannels = 0;

      for (let fixture of this.fixturePool) {
        let mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(fixture.profileUuid), fixture);

        if (i >= fixture.dmxFirstChannel && i < fixture.dmxFirstChannel + mode.channels.length) {
          // this channel is already occupied by a fixture -> move forward to the end of the fixture
          if (mode.channels.length > occupiedChannels) {
            occupiedChannels = mode.channels.length - (i - fixture.dmxFirstChannel);
          }
        }
      }

      if (occupiedChannels > 0) {
        i += occupiedChannels - 1;
        freeChannels = 0;
      } else {
        freeChannels++;
      }

      if (freeChannels == neededChannels) {
        return i - freeChannels + 1;
      }
    }

    // no free space left for the needed channels
    return -1;
  }

  addFixture(searchProfile: FixtureProfile) {
    // Load the profile details, if not already done. There is only a
    // minimal profile passed from the search.
    this.fixtureService.loadProfileByUuid(searchProfile.uuid).subscribe(() => {
      let profile = this.fixtureService.getProfileByUuid(searchProfile.uuid);
      let fixture = new Fixture();
      fixture.uuid = this.uuidService.getUuid();
      fixture.profileUuid = profile.uuid;
      fixture.name = profile.name;

      if (profile.modes && profile.modes.length > 0) {
        fixture.modeShortName = profile.modes[0].shortName;
      }

      // add the same mode as an existing fixture, if available
      let existingModeShortName: string
      for (let existingFixture of this.fixturePool) {
        let existingProfile = this.fixtureService.getProfileByUuid(existingFixture.profileUuid);

        if (existingProfile == profile) {
          existingModeShortName = existingFixture.modeShortName;
          break;
        }
      }

      if (existingModeShortName) {
        fixture.modeShortName = existingModeShortName;
      } else {
        fixture.modeShortName = profile.modes[0].shortName || profile.modes[0].name;
      }

      const mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(fixture.profileUuid), fixture);
      const firstChannel = this.getNextFreeDmxChannel(mode.channels.length);

      if (firstChannel >= 0) {
        fixture.dmxFirstChannel = firstChannel;
        this.fixturePool.push(fixture);
        this.selectFixture(fixture);
        this.lastAddedFixture = fixture;
      } else {
        // no free space anymore
        let msg = 'designer.fixture-pool.no-free-space';
        let title = 'designer.fixture-pool.no-free-space-title';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.error(result[msg], result[title]);
        });
      }
    });
  }

  addCopy(originalFixture: Fixture) {
    let fixture = new Fixture();
    fixture.uuid = this.uuidService.getUuid();
    fixture.profileUuid = originalFixture.profileUuid;
    fixture.name = originalFixture.name;
    fixture.modeShortName = originalFixture.modeShortName;
    fixture.dmxFirstChannel = originalFixture.dmxFirstChannel;
    fixture.dmxUniverseUuid = originalFixture.dmxUniverseUuid;

    this.fixturePool.push(fixture);
    this.selectFixture(fixture);
  }

  removeFixture(fixture: Fixture) {
    for (let i = 0; i < this.fixturePool.length; i++) {
      if (this.fixturePool[i].uuid == fixture.uuid) {
        if (this.selectedFixture == this.fixturePool[i]) {
          this.selectFixture(undefined);
        }
        this.fixturePool.splice(i, 1);
        break;
      }
    }

    if (!this.selectedFixture && this.fixturePool && this.fixturePool.length > 0) {
      this.selectFixture(this.selectedFixture = this.fixturePool[0]);
    }

    // remove unused profiles
    for (let i = 0; i < this.projectService.project.fixtureProfiles.length; i++) {
      let profileUsed = false;

      for (let fixture of this.fixturePool) {
        if (fixture.profileUuid == this.projectService.project.fixtureProfiles[i].uuid) {
          profileUsed = true;
          break;
        }
      }

      if (!profileUsed) {
        this.projectService.project.fixtureProfiles.splice(i, 1);
      }
    }
  }

  channelOccupied(index: number): boolean {
    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(fixture.profileUuid), fixture);

      if (index >= fixture.dmxFirstChannel && index < fixture.dmxFirstChannel + mode.channels.length) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedStart(index: number): boolean {
    for (let fixture of this.fixturePool) {
      if (index == fixture.dmxFirstChannel) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedEnd(index: number): boolean {
    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(fixture.profileUuid), fixture);

      if (index == fixture.dmxFirstChannel + mode.channels.length - 1) {
        return true;
      }
    }

    return false;
  }

  channelOverlapped(index: number): boolean {
    let occupiedFixture: Fixture;

    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(fixture.profileUuid), fixture);

      if (index >= fixture.dmxFirstChannel && index < fixture.dmxFirstChannel + mode.channels.length) {
        if (occupiedFixture) {
          if (occupiedFixture.dmxFirstChannel != fixture.dmxFirstChannel || occupiedFixture.modeShortName != fixture.modeShortName) {
            // fixtures are allowed to overlap, if they start at the same channel and
            // use the same mode. otherwise it's not allowed.
            return true;
          }
        } else {
          occupiedFixture = fixture;
        }
      }
    }

    return false;
  }

  channelMouseDown(event: any) {
    // start dragging
    const selectedIndex = event.target.dataset.index;
    let newSelectedFixture: Fixture;

    // find a dragging fixture and select it, but don't change the selection, if the
    // currently selected fixture might also be selected (on overlapped fixtures)
    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(fixture.profileUuid), fixture);

      if (selectedIndex >= fixture.dmxFirstChannel && selectedIndex <= fixture.dmxFirstChannel + mode.channels.length - 1) {
        if (this.selectedFixture == fixture) {
          newSelectedFixture = fixture;
          break;
        }

        if (!newSelectedFixture) {
          newSelectedFixture = fixture;
        }
      }
    }

    if (newSelectedFixture) {
      if (newSelectedFixture != this.selectedFixture) {
        this.selectFixture(newSelectedFixture);
      }

      this.channelDragFixture = newSelectedFixture;
      this.channelDragOffset = selectedIndex - newSelectedFixture.dmxFirstChannel;
    }
  }

  channelSelected(index: number): boolean {
    if (!this.selectedFixture) {
      return false;
    }

    if (index >= this.selectedFixture.dmxFirstChannel) {
      let mode = this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(this.selectedFixture.profileUuid), this.selectedFixture);

      if (index < this.selectedFixture.dmxFirstChannel + mode.channels.length) {
        return true;
      }
    }

    return false;
  }

  // register mouse up globally (e.g. also outside the DMX mapping)
  @HostListener('window:mouseup', ['$event'])
  mouseUp(event: any) {
    // finish dragging
    this.channelDragFixture = undefined;
    this.channelDragOffset = undefined;
  }

  channelMouseOver(event: any) {
    // perform dragging
    const selectedIndex = event.target.dataset.index;

    if (this.channelDragFixture && selectedIndex - this.channelDragOffset >= 0 && selectedIndex - this.channelDragOffset + this.fixtureService.getModeByFixture(this.fixtureService.getProfileByUuid(this.channelDragFixture.profileUuid), this.channelDragFixture).channels.length - 1 <= 511) {
      this.channelDragFixture.dmxFirstChannel = selectedIndex - this.channelDragOffset;
    }
  }

  ok() {
    // don't allow OK if overlapping fixtures exist
    for (let i = 0; i < this.dmxChannels.length; i++) {
      if (this.channelOverlapped(i)) {
        let msg = 'designer.fixture-pool.channel-occupied';
        let title = 'designer.fixture-pool.channel-occupied-title';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.error(result[msg], result[title]);
        });

        return;
      }
    }

    this.projectService.project.fixtures = this.fixturePool;

    this.fixtureService.updateCachedFixtures();
    this.presetService.removeDeletedFixtures();
    this.previewService.updateFixtureSetup();
    this.presetService.updateFixtureSelection();
    this.presetService.fixtureSelectionChanged.next();
    this.presetService.previewLive();

    this.onClose.next(1);
    this.bsModalRef.hide();
  }

  cancel() {
    this.onClose.next(2);
    this.bsModalRef.hide()
  }

  updateProfiles() {
    this.updatingProfiles = true;

    // TODO
    this.fixtureService.updateProfiles().pipe(finalize(() => {
      this.updatingProfiles = false;
    }), catchError(() => {
      let msg = 'designer.fixture-pool.profiles-update-error';
      let title = 'designer.fixture-pool.profiles-update-error-title';

      this.translateService.get([msg, title]).subscribe(result => {
        this.toastrService.error(result[msg], result[title]);
      });

      return undefined;
    }))
      .subscribe(() => {
        this.loadProfiles();

        let msg = 'designer.fixture-pool.profiles-updated';
        let title = 'designer.fixture-pool.profiles-updated-title';

        this.translateService.get([msg, title]).subscribe(result => {
          this.toastrService.success(result[msg], result[title]);
        });
      });
  }

}
