import { Component, OnInit } from '@angular/core';
import { PresetService } from 'src/app/services/preset.service';

@Component({
  selector: 'app-fixture-property',
  templateUrl: './fixture-property.component.html',
  styleUrls: ['./fixture-property.component.css']
})
export class FixturePropertyComponent implements OnInit {

  constructor(
    public presetService: PresetService
  ) { }

  ngOnInit() {
  }

}
