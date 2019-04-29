import { Injectable } from '@angular/core';
import { Fixture } from '../models/fixture';
import { Project } from '../models/project';
import { Subject } from 'rxjs';
import { UuidService } from './uuid.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  // the current project
  public project: Project;

  public fixtureAdded: Subject<Fixture> = new Subject<Fixture>();

  constructor(
    private uuidService: UuidService
  ) {
    this.project = new Project(this.uuidService);
  }

  addFixture(fixture: Fixture) {
    this.project.fixtures.push(fixture);
    this.fixtureAdded.next(fixture);
  }

}
