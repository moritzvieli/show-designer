import { Component, OnInit } from '@angular/core';
import { PresetService } from '../../../services/preset.service';

@Component({
  selector: 'app-fixture-capability-pan-tilt',
  templateUrl: './fixture-capability-pan-tilt.component.html',
  styleUrls: ['./fixture-capability-pan-tilt.component.css']
})
export class FixtureCapabilityPanTiltComponent implements OnInit {

  constructor(
    private presetService: PresetService
  ) { }

  ngOnInit() {
  }

  getValue(): number {
    return 0;
  }

  setValue(value: any) {

  }

  changeActive(active: boolean) {

  }

}
