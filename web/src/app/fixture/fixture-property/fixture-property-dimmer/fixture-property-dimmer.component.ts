import { Component, OnInit } from '@angular/core';
import { PresetService } from 'src/app/services/preset.service';
import { FixturePropertyType } from 'src/app/models/fixture-property';
import { DmxService } from 'src/app/services/dmx.service';

@Component({
  selector: 'app-fixture-property-dimmer',
  templateUrl: './fixture-property-dimmer.component.html',
  styleUrls: ['./fixture-property-dimmer.component.css']
})
export class FixturePropertyDimmerComponent implements OnInit {

  constructor(
    private presetService: PresetService,
    private dmxService: DmxService
    ) { }

  ngOnInit() {
  }

  getValue(): number {
    return this.presetService.getPropertyValue(FixturePropertyType.dimmer);
  }

  setValue(value: any) {
    if(!this.dmxService.isValidDmxValue(value)) {
      return;
    }

    this.presetService.setPropertyValue(FixturePropertyType.dimmer, value);
  }

  changeActive(active: boolean) {
    if (active) {
      this.setValue(255);
    } else {
      this.presetService.deletePropertyValue(FixturePropertyType.dimmer);
    }
  }

}
