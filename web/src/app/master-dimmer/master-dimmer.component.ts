import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MasterDimmerService } from '../services/master-dimmer.service';

@Component({
  selector: 'app-master-dimmer',
  templateUrl: './master-dimmer.component.html',
  styleUrls: ['./master-dimmer.component.css']
})
export class MasterDimmerComponent implements OnInit {

  constructor(
    public masterDimmerService: MasterDimmerService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  setValue(value: any) {
    if(isNaN(value)){
      return false;
    }

    if(value < 0 || value > 1) {
      return false;
    }

    this.masterDimmerService.masterDimmerValue = value;
    this.changeDetectorRef.detectChanges();
  }

  getValue(): number {
    return Math.round(this.masterDimmerService.masterDimmerValue * 100 * 100) / 100;
  }

}
