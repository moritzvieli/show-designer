import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { FixtureTemplate } from '../models/fixture-template';
import { FixtureMode } from '../models/fixture-mode';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { FixtureChannel } from '../models/fixture-channel';
import { ProjectService } from './project.service';
import { Observable, forkJoin, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

  constructor(
    private http: HttpClient,
    private projectService: ProjectService
  ) { }

  getFixtureByUuid(uuid: string): Fixture {
    for (let fixture of this.projectService.project.fixtures) {
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
    for (let fixtureTemplate of this.projectService.project.fixtureTemplates) {
      if (fixtureTemplate.uuid == uuid) {
        return fixtureTemplate;
      }
    }
  }

  loadTemplateByUuid(uuid: string): Observable<void> {
    let loadedTemplate = this.getTemplateByUuid(uuid);

    if (loadedTemplate) {
      // This template is already loaded
      return of(undefined);
    }

    // Load the metadata and the template
    return forkJoin(
      this.http.get('fixture-search?uuid=' + encodeURI(uuid)),
      this.http.get('fixture?uuid=' + encodeURI(uuid))
    ).pipe(map(result => {
      let fixtureTemplate = new FixtureTemplate(result[0][0], result[1]);
      this.projectService.project.fixtureTemplates.push(fixtureTemplate);
    }));
  }

  getTemplateByFixture(fixture: Fixture): FixtureTemplate {
    return this.getTemplateByUuid(fixture.fixtureTemplateUuid);
  }

  getModeByFixture(fixture: Fixture): FixtureMode {
    let template = this.getTemplateByFixture(fixture);

    for (let mode of template.modes) {
      if (mode.shortName == fixture.modeShortName) {
        return mode;
      }
    }
  }

  getChannelsByFixture(fixture: Fixture): FixtureChannel[] {
    let template = this.getTemplateByFixture(fixture);
    let mode = this.getModeByFixture(fixture);
    let channels: FixtureChannel[] = [];

    if (!mode) {
      return channels;
    }

    for (let modeChannel of mode.channels) {
      if (modeChannel) {
        for (let availableChannelName in template.availableChannels) {
          let availableChannel: FixtureChannel = template.availableChannels[availableChannelName];

          if (modeChannel == availableChannelName || availableChannel.fineChannelAliases.indexOf(modeChannel) > -1) {
            channels.push(availableChannel);
          }
        }
      } else {
        // null may be passed as a placeholder for an undefined channel
        channels.push(null);
      }
    }

    return channels;
  }

}
