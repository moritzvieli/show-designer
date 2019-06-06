import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../../services/preset.service';
import { FixtureCapabilityType } from '../../../models/fixture-capability';

@Component({
  selector: 'app-fixture-capability-dimmer',
  templateUrl: './fixture-capability-dimmer.component.html',
  styleUrls: ['./fixture-capability-dimmer.component.css']
})
export class FixtureCapabilityDimmerComponent implements OnInit {

  constructor(
    private presetService: PresetService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  getValue(): number {
    let dimmer = this.presetService.getCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.Intensity);
    if (dimmer == undefined) {
      return undefined;
    }

    return Math.round(dimmer * 100 * 100) / 100;
  }

  setValue(value: any) {
    if (isNaN(value)) {
      return;
    }

    if (value < 0 || value > 1) {
      return;
    }

    this.presetService.setCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.Intensity, value);
    this.changeDetectorRef.detectChanges();
  }

  changeActive(active: boolean) {
    if (active) {
      this.setValue(1);
    } else {
      this.presetService.deleteCapabilityValue(this.presetService.selectedPreset, FixtureCapabilityType.Intensity);
      this.changeDetectorRef.detectChanges();
    }
  }

}
