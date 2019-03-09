import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

  fixtureTemplates: FixtureTemplate[] = [];

  fixtures: Fixture[] = [];
  fixtureAdded: Subject<Fixture> = new Subject<Fixture>();

  constructor() { }

  addFixture(fixture: Fixture) {
    this.fixtures.push(fixture);
    this.fixtureAdded.next(fixture);
  }

  getModeByUuid(uuid: string, template: FixtureTemplate): FixtureMode {
    for (let mode of template.fixtureModes) {
      if (mode.uuid = uuid) {
        return mode;
      }
    }
  }

  getTemplateByUuid(uuid: string): FixtureTemplate {
    for (let template of this.fixtureTemplates) {
      if (template.uuid = uuid) {
        return template;
      }
    }
  }

}
