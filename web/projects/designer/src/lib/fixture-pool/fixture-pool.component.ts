import { Component, OnInit, HostListener } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureService } from '../services/fixture.service';
import { Fixture } from '../models/fixture';
import { UuidService } from '../services/uuid.service';
import { ProjectService } from '../services/project.service';
import { Subject } from 'rxjs';

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
  public showChannelNumbers: boolean = false;
  public channelDragFixture: Fixture;
  public channelDragOffset: number;

  public onClose: Subject<number> = new Subject();

  constructor(
    public bsModalRef: BsModalRef,
    public fixtureService: FixtureService,
    private uuidService: UuidService,
    public projectService: ProjectService
  ) { }

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

  addFixture(template: FixtureTemplate) {
    // Load the template details, if not already done. There is only a
    // minimal template passed from the search.
    this.fixtureService.loadTemplateByUuid(template.uuid).subscribe(() => {
      let fixture = new Fixture(this.fixtureService.getTemplateByUuid(template.uuid));
      fixture.uuid = this.uuidService.getUuid();

      // TODO add the same mode as the last added fixture with the same template
      const mode = this.fixtureService.getModeByFixture(fixture);
      const firstChannel = this.getNextFreeDmxChannel(mode.channels.length);

      if (firstChannel >= 0) {
        fixture.dmxFirstChannel = firstChannel;
        this.fixturePool.push(fixture);
        this.selectedFixture = fixture;
      } else {
        // TODO show a toast-error -> no free space anymore
        console.log('No space left!');
      }
    });
  }

  removeFixture(fixture: Fixture) {
    for (let i = 0; i < this.fixturePool.length; i++) {
      if (this.fixturePool[i].uuid == fixture.uuid) {
        this.fixturePool.splice(i, 1);
      }
    }

    if (!this.selectedFixture && this.fixturePool && this.fixturePool.length > 0) {
      this.selectedFixture = this.fixturePool[0];
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
    let count = 0;

    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(fixture);

      if (index >= fixture.dmxFirstChannel && index < fixture.dmxFirstChannel + mode.channels.length) {
        if (count == 0) {
          count++;
        } else {
          return true;
        }
      }
    }

    return false;
  }

  channelMouseDown(event: any) {
    // start dragging
    const selectedIndex = event.target.dataset.index;

    // find a dragging fixture
    for (let fixture of this.fixturePool) {
      let mode = this.fixtureService.getModeByFixture(fixture);

      if (selectedIndex >= fixture.dmxFirstChannel && selectedIndex <= fixture.dmxFirstChannel + mode.channels.length - 1) {
        this.channelDragFixture = fixture;
        this.channelDragOffset = selectedIndex - fixture.dmxFirstChannel;
        break;
      }
    }
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
    // TODO Load all required templates
    // TODO don't allow OK if overlapping fixtures exist
    this.onClose.next(1);
    this.bsModalRef.hide()
  }

  cancel() {
    this.onClose.next(2);
    this.bsModalRef.hide()
  }

}
