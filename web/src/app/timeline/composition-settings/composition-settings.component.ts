import { Component, OnInit } from '@angular/core';
import { Composition } from 'src/app/models/composition';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-composition-settings',
  templateUrl: './composition-settings.component.html',
  styleUrls: ['./composition-settings.component.css']
})
export class CompositionSettingsComponent implements OnInit {

  composition: Composition;

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
  }

}
