import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureService } from '../services/fixture.service';

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

  constructor(
    public bsModalRef: BsModalRef,
    private fixtureService: FixtureService
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
    
  }

  removeFixture(template: FixtureTemplate) {
    
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
      if(index == fixture.firstChannel) {
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

}
