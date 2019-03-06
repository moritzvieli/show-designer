import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

  fixtures: Fixture[] = [];
  fixtureAdded: Subject<Fixture> = new Subject<Fixture>();

  selectedFixtures: Fixture[] = [];

  constructor() { }

  addFixture(fixture: Fixture) {
    this.fixtures.push(fixture);
    this.fixtureAdded.next(fixture);
  }

  fixtureIsSelected(fixture: Fixture): boolean {
    for (let selectedFixture of this.selectedFixtures) {
      if (selectedFixture.uuid == fixture.uuid) {
        return true;
      }
    }

    return false;
  }

  switchFixtureSelection(fixture: Fixture) {
    // Select a fixture if not yet selected or unselect it otherwise
    if(this.fixtureIsSelected(fixture)) {
      for (let i = 0; i < this.selectedFixtures.length; i++) {
        if (this.selectedFixtures[i].uuid == fixture.uuid) {
          this.selectedFixtures.splice(i, 1);
          return;
        }
      }
    } else {
      this.selectedFixtures.push(fixture);
    }
  }

}
