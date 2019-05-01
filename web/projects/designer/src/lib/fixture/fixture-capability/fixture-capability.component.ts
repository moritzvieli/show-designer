import { Component, OnInit } from '@angular/core';
import { PresetService } from '../../services/preset.service';

@Component({
  selector: 'app-fixture-capability',
  templateUrl: './fixture-capability.component.html',
  styleUrls: ['./fixture-capability.component.css']
})
export class FixtureCapabilityComponent implements OnInit {

  constructor(public presetService: PresetService) { }

  ngOnInit() {
  }

}
