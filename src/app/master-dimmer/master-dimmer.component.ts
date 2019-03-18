import { Component, OnInit } from '@angular/core';
import { MasterDimmerService } from '../services/master-dimmer.service';
import { DmxService } from '../services/dmx.service';

@Component({
  selector: 'app-master-dimmer',
  templateUrl: './master-dimmer.component.html',
  styleUrls: ['./master-dimmer.component.css']
})
export class MasterDimmerComponent implements OnInit {

  constructor(
    public masterDimmerService: MasterDimmerService,
    private dmxService: DmxService
  ) { }

  ngOnInit() {
  }

  setValue(value: any) {
    if(!this.dmxService.isValidDmxValue(value)) {
      return;
    }

    this.masterDimmerService.masterDimmerValue = value;
  }

  getValue(): number {
    return Math.round(this.masterDimmerService.masterDimmerValue * 100 * 100) / 100;
  }

}
