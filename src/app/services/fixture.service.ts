import { Fixture } from '../models/fixture';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FixtureService {

  fixtures: Fixture[] = [];

  fixtureAdded: Subject<Fixture> = new Subject<Fixture>();

  constructor() { }

  addFixture(fixture: Fixture) {
    this.fixtures.push(fixture);
    this.fixtureAdded.next(fixture);
  }

}
