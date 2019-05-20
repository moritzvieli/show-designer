import { Component, OnInit, Input } from '@angular/core';
import { PresetService } from '../../../services/preset.service';

@Component({
  selector: 'app-fixture-capability-color-wheel',
  templateUrl: './fixture-capability-color-wheel.component.html',
  styleUrls: ['./fixture-capability-color-wheel.component.css']
})
export class FixtureCapabilityColorWheelComponent implements OnInit {

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
