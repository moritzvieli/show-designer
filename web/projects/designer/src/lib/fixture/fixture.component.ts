import { Component, OnInit } from '@angular/core';
import { Fixture } from '../models/fixture';
import { PresetService } from '../services/preset.service';
import { ProjectService } from '../services/project.service';
import { BsModalService } from 'ngx-bootstrap';
import { FixturePoolComponent } from '../fixture-pool/fixture-pool.component';

@Component({
  selector: 'app-fixture',
  templateUrl: './fixture.component.html',
  styleUrls: ['./fixture.component.css']
})
export class FixtureComponent implements OnInit {

  constructor(
    public projectService: ProjectService,
    public presetService: PresetService,
    private modalService: BsModalService
  ) { }

  ngOnInit() { }

  deleteFixture() {
    // TODO Also delete the all sceneFixtureProperties for all scenes, if any
  }

  selectFixture(event: any, fixture: Fixture) {
    this.presetService.switchFixtureSelection(fixture);
    this.presetService.fixtureSelectionChanged.next();
  }

  selectAll() {
    // TODO
  }

  selectNone() {
    // TODO
  }

  openFixturePool() {
    let bsModalRef = this.modalService.show(FixturePoolComponent, { keyboard: false, ignoreBackdropClick: true, class: 'modal-full' });
  }

}
