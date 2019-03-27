import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { Subject, Observable, of, forkJoin } from 'rxjs';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

  private fixtureTemplates: FixtureTemplate[] = [];

  fixtures: Fixture[] = [];
  fixtureAdded: Subject<Fixture> = new Subject<Fixture>();

  constructor(private http: HttpClient) { }

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

  getFixtureByUuid(uuid: string): Fixture {
    for (let fixture of this.fixtures) {
      if (fixture.uuid = uuid) {
        return fixture;
      }
    }
  }

  private getCachedTemplate(uuid: string): FixtureTemplate {
    for (let fixtureTemplate of this.fixtureTemplates) {
      if (fixtureTemplate.uuid == uuid) {
        return fixtureTemplate;
      }
    }
  }

  getSearchTemplates(): Observable<FixtureTemplate[]> {
    return this.http.get('fixture-search').pipe(map((response: Array<Object>) => {
      let searchTemplates: FixtureTemplate[] = [];

      for (let template of response) {
        searchTemplates.push(new FixtureTemplate(template));
      }

      return searchTemplates;
    }));
  }

  getTemplate(uuid: string): Observable<FixtureTemplate> {
    let existingTemplate = this.getCachedTemplate(uuid);

    if (existingTemplate) {
      return of(existingTemplate);
    }

    // Get the metadata and the template
    return forkJoin(
      this.http.get('fixture-search?uuid=' + uuid),
      this.http.get('fixture?uuid=' + uuid)
    ).pipe(map(result => {
      let existingTemplate = this.getCachedTemplate(uuid);

      if (existingTemplate) {
        return existingTemplate;
      }
console.log(result);
      // let fixtureTemplate = new FixtureTemplate(uuid, result[0].manufacturerShortName);
      // this.fixtureTemplates.push(fixtureTemplate);

      //return fixtureTemplate;
    }));
  }

}
