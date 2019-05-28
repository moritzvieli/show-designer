import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureService } from '../services/fixture.service';
import { Fixture } from '../models/fixture';
import { UuidService } from '../services/uuid.service';
import { ProjectService } from '../services/project.service';
import { Subject } from 'rxjs';
import { PreviewService } from '../services/preview.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PresetService } from '../services/preset.service';

@Component({
  selector: 'app-fixture-pool',
  templateUrl: './fixture-pool.component.html',
  styleUrls: ['./fixture-pool.component.css']
})
export class FixturePoolComponent implements OnInit {

  private templates: FixtureTemplate[];
  public filteredTemplates: FixtureTemplate[];
  public loadingTemplates: boolean = false;

  public fixturePool: Fixture[];

  public dmxChannels: number[] = [];
  public selectedFixture: Fixture;
  public selectedFixtureTemplate: FixtureTemplate;
  public showChannelNumbers: boolean = false;
  public channelDragFixture: Fixture;
  public channelDragOffset: number;

  public onClose: Subject<number> = new Subject();

  private lastAddedFixture: Fixture;

  constructor(
    public bsModalRef: BsModalRef,
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    public projectService: ProjectService,
    private previewService: PreviewService,
    private translateService: TranslateService,
    private toastrService: ToastrService,
    private presetService: PresetService
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

    this.loadingTemplates = true;

    this.fixtureService.getSearchTemplates().subscribe(templates => {
      this.templates = templates;
      this.filterTemplates();
      this.loadingTemplates = false;
    });
  }

  selectFixture(fixture: Fixture) {
    this.selectedFixtureTemplate = undefined;
    if (fixture) {
      this.selectedFixtureTemplate = this.fixtureService.getTemplateByFixture(fixture);
    }
    this.selectedFixture = fixture;
  }

  filterTemplates(searchValue?: string) {
    if (!searchValue) {
      this.filteredTemplates = this.templates;
      return;
    }

    this.filteredTemplates = [];

    for (let template of this.templates) {
      if (template.uuid.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
        || template.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
        || template.manufacturerName.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {

        this.filteredTemplates.push(template);
      }
    }
  }

  private getNextFreeDmxChannel(neededChannels: number): number {
    // get the next free space for this fixture
    let freeChannels = 0;

    for (let i = 0; i < 512; i++) {
      let occupiedChannels = 0;

      for (let fixture of this.fixturePool) {
        let mode = this.fixtureService.getModeByFixture(fixture);

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

  addFixture(searchTemplate: FixtureTemplate) {
    // Load the template details, if not already done. There is only a
    // minimal template passed from the search.
    this.fixtureService.loadTemplateByUuid(searchTemplate.uuid).subscribe(() => {
      let template = this.fixtureService.getTemplateByUuid(searchTemplate.uuid);
      let fixture = new Fixture(template);
      fixture.uuid = this.uuidService.getUuid() + '#' + this.fixturePool.length;

      // add the same mode as an existing fixture, if available
      let existingModeShortName: string
      for (let existingFixture of this.fixturePool) {
        let existingTemplate = this.fixtureService.getTemplateByFixture(existingFixture);

        if (existingTemplate == template) {
          existingModeShortName = existingFixture.modeShortName;
          break;
        }
      }

      if (existingModeShortName) {
        fixture.modeShortName = existingModeShortName;
      } else {
        fixture.modeShortName = template.modes[0].shortName || template.modes[0].name;
      }

      const mode = this.fixtureService.getModeByFixture(fixture);
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
    let template = this.fixtureService.getTemplateByFixture(originalFixture);
    let fixture = new Fixture(template);
    fixture.uuid = this.uuidService.getUuid();
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
  }

  channelOccupied(index: number): boolean {
    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(fixture);

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
      let mode = this.fixtureService.getModeByFixture(fixture);

      if (index == fixture.dmxFirstChannel + mode.channels.length - 1) {
        return true;
      }
    }

    return false;
  }

  channelOverlapped(index: number): boolean {
    let occupiedFixture: Fixture;

    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(fixture);

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
      let mode = this.fixtureService.getModeByFixture(fixture);

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
      let mode = this.fixtureService.getModeByFixture(this.selectedFixture);

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

    if (this.channelDragFixture && selectedIndex - this.channelDragOffset >= 0 && selectedIndex - this.channelDragOffset + this.fixtureService.getModeByFixture(this.channelDragFixture).channels.length - 1 <= 511) {
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

    this.presetService.removeDeletedFixtures();
    this.previewService.updateFixtureSetup();
    this.presetService.updateFixtureSelection();

    this.presetService.fixtureSelectionChanged.next();

    this.onClose.next(1);
    this.bsModalRef.hide();
  }

  cancel() {
    this.onClose.next(2);
    this.bsModalRef.hide()
  }

}
