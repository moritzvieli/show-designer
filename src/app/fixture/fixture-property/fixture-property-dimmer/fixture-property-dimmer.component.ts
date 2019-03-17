import { Component, OnInit } from '@angular/core';
import { PresetService } from 'src/app/services/preset.service';
import { FixturePropertyType } from 'src/app/models/fixture-property';

@Component({
  selector: 'app-fixture-property-dimmer',
  templateUrl: './fixture-property-dimmer.component.html',
  styleUrls: ['./fixture-property-dimmer.component.css']
})
export class FixturePropertyDimmerComponent implements OnInit {

  constructor(private presetService: PresetService) { }

  ngOnInit() {
  }

  changeActive(active: boolean) {
  }

  getValue(): number {
    return this.presetService.getPropertyValue(FixturePropertyType.dimmer);
  }

  setValue(value: number) {
    this.presetService.setPropertyValue(FixturePropertyType.dimmer, value);
  }

}
