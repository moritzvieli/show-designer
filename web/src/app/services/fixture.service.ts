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

  getFixtureByUuid(uuid: string): Fixture {
    for (let fixture of this.fixtures) {
      if (fixture.uuid = uuid) {
        return fixture;
      }
    }
  }

  // Get all templates to search for (only metadata)
  getSearchTemplates(): Observable<FixtureTemplate[]> {
    return this.http.get('fixture-search').pipe(map((response: Array<Object>) => {
      let searchTemplates: FixtureTemplate[] = [];

      for (let template of response) {
        searchTemplates.push(new FixtureTemplate(template));
      }

      return searchTemplates;
    }));
  }

  getTemplateByUuid(uuid: string): FixtureTemplate {
    for (let fixtureTemplate of this.fixtureTemplates) {
      if (fixtureTemplate.uuid == uuid) {
        return fixtureTemplate;
      }
    }
  }

  loadTemplateByUuid(uuid: string): Observable<void> {
    let loadedTemplate = this.getTemplateByUuid(uuid);
    
    if(loadedTemplate) {
      // This template is already loaded
      return;
    }

    // Load the metadata and the template
    return forkJoin(
      this.http.get('fixture-search?uuid=' + uuid),
      this.http.get('fixture?uuid=' + uuid)
    ).pipe(map(result => {
      let fixtureTemplate = new FixtureTemplate(result[0][0], result[1]);
      this.fixtureTemplates.push(fixtureTemplate);
    }));
  }

  getTemplateByFixture(fixture: Fixture) {
    return this.getTemplateByUuid(fixture.fixtureTemplateUuid);
  }

}
