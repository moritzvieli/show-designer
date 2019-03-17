import { Component, OnInit } from '@angular/core';
import { MasterDimmerService } from '../services/master-dimmer.service';

@Component({
  selector: 'app-master-dimmer',
  templateUrl: './master-dimmer.component.html',
  styleUrls: ['./master-dimmer.component.css']
})
export class MasterDimmerComponent implements OnInit {

  constructor(public masterDimmerService: MasterDimmerService) { }

  ngOnInit() {
  }

}
