import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PresetService } from '../../../services/preset.service';

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
    if(this.presetService.selectedPreset.dimmer == undefined) {
      return undefined;
    }

    return Math.round(this.presetService.selectedPreset.dimmer * 100 * 100) / 100;
  }

  setValue(value: any) {
    if (isNaN(value)) {
      return;
    }

    if (value < 0 || value > 1) {
      return;
    }

    this.presetService.selectedPreset.dimmer = value;
    this.changeDetectorRef.detectChanges();
  }

  changeActive(active: boolean) {
    if (active) {
      this.setValue(1);
    } else {
      this.presetService.selectedPreset.dimmer = undefined;
      this.changeDetectorRef.detectChanges();
    }
  }

}
