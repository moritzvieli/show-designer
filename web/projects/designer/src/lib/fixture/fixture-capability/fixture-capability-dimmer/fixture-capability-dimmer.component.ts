import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../../services/preset.service';
import { DmxService } from '../../../services/dmx.service';
import { FixtureCapabilityType } from '../../../models/fixture-capability';

@Component({
  selector: 'app-fixture-capability-dimmer',
  templateUrl: './fixture-capability-dimmer.component.html',
  styleUrls: ['./fixture-capability-dimmer.component.css']
})
export class FixtureCapabilityDimmerComponent implements OnInit {

  constructor(
    private presetService: PresetService,
    private dmxService: DmxService,
    private changeDetectorRef: ChangeDetectorRef
    ) { }

  ngOnInit() {
  }

  getValue(): number {
    // TODO
    // return this.presetService.getCapabilityValue(FixtureCapabilityType.Intensity);
    return 0;
  }

  setValue(value: any) {
    if(!this.dmxService.isValidDmxValue(value)) {
      return;
    }

    // TODO
    // this.presetService.setCapabilityValue(FixtureCapabilityType.Intensity, value);
    this.changeDetectorRef.detectChanges();
  }

  changeActive(active: boolean) {
    if (active) {
      this.setValue(255);
    } else {
      // TODO
      // this.presetService.deleteCapabilityValue(FixtureCapabilityType.Intensity);
    }
  }

}
