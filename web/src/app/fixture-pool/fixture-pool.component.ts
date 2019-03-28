import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureService } from '../services/fixture.service';
import { Fixture } from '../models/fixture';
import { UuidService } from '../services/uuid.service';

@Component({
  selector: 'app-fixture-pool',
  templateUrl: './fixture-pool.component.html',
  styleUrls: ['./fixture-pool.component.css']
})
export class FixturePoolComponent implements OnInit {

  private templates: FixtureTemplate[];
  filteredTemplates: FixtureTemplate[];

  loadingTemplates: boolean = false;

  dmxChannels: number[] = [];

  selectedFixture: Fixture;

  constructor(
    public bsModalRef: BsModalRef,
    public fixtureService: FixtureService,
    private uuidService: UuidService
  ) { }

  ngOnInit() {
    for(let i = 0; i < 512; i++) {
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

  addFixture(template: FixtureTemplate) {
    // Load the template details, if not already done
    this.fixtureService.loadTemplateByUuid(template.uuid).subscribe(() => {
      let fixture = new Fixture(this.uuidService, template);
      this.fixtureService.fixtures.push(fixture);
      this.selectedFixture = fixture;
    });
  }

  removeFixture(fixture: Fixture) {
    for(let i = 0; i < this.fixtureService.fixtures.length; i ++) {
      if(this.fixtureService.fixtures[i].uuid == fixture.uuid) {
        this.fixtureService.fixtures.splice(i, 1);
      }
    }

    if(!this.selectedFixture && this.fixtureService.fixtures && this.fixtureService.fixtures.length > 0) {
      this.selectedFixture = this.fixtureService.fixtures[0];
    }
  }

  channelOccupied(index: number): boolean {
    // for(let fixture of this.fixtureService.fixtures) {
    //   let template = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
    //   let mode = this.fixtureService.getModeByUuid(fixture.modeUuid, template);

    //   if(index >= fixture.firstChannel && index < fixture.firstChannel + mode.channelCount) {
    //     return true;
    //   }
    // }

    return false;
  }

  channelOccupiedStart(index: number): boolean {
    for(let fixture of this.fixtureService.fixtures) {
      if(index == fixture.dmxFirstChannel) {
        return true;
      }
    }

    return false;
  }

  channelOccupiedEnd(index: number): boolean {
    // for(let fixture of this.fixtureService.fixtures) {
    //   let template = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
    //   let mode = this.fixtureService.getModeByUuid(fixture.modeUuid, template);

    //   if(index == fixture.firstChannel + mode.channelCount - 1) {
    //     return true;
    //   }
    // }

    return false;
  }

  ok() {
    // TODO Load all required templates

    this.bsModalRef.hide()
  }

}
