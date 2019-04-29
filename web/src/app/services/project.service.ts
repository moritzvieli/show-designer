import { Injectable } from '@angular/core';
import { Fixture } from '../models/fixture';
import { Project } from '../models/project';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  // the current project
  public project: Project;

  public fixtureAdded: Subject<Fixture> = new Subject<Fixture>();

  constructor() {
    this.project = new Project();
    this.project.name = 'New Project';
  }

  addFixture(fixture: Fixture) {
    this.project.fixtures.push(fixture);
    this.fixtureAdded.next(fixture);
  }

}
