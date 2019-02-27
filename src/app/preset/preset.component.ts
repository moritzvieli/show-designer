import { Component, OnInit } from '@angular/core';
import { PresetService } from '../services/preset.service';

@Component({
  selector: 'app-preset',
  templateUrl: './preset.component.html',
  styleUrls: ['./preset.component.css']
})
export class PresetComponent implements OnInit {

  constructor(
    public presetService: PresetService
  ) { }

  ngOnInit() {
  }

}
