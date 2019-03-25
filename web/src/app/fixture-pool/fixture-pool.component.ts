import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-fixture-pool',
  templateUrl: './fixture-pool.component.html',
  styleUrls: ['./fixture-pool.component.css']
})
export class FixturePoolComponent implements OnInit {

  constructor(public bsModalRef: BsModalRef) { }

  ngOnInit() {
  }

}
