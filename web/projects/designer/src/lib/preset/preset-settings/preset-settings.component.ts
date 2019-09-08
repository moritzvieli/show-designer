import { Component, OnInit } from '@angular/core';
import { Preset } from '../../models/preset';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'lib-preset-settings',
  templateUrl: './preset-settings.component.html',
  styleUrls: ['./preset-settings.component.css']
})
export class PresetSettingsComponent implements OnInit {

  preset: Preset;

  name: string;
  startMillis: number;
  endMillis: number;
  fadeInMillis: number;
  fadeOutMillis: number;

  constructor(
    public bsModalRef: BsModalRef
  ) {
  }

  ngOnInit() {
    this.name = this.preset.name;
    this.startMillis = this.preset.startMillis;
    this.endMillis = this.preset.endMillis;
    this.fadeInMillis = this.preset.fadeInMillis;
    this.fadeOutMillis = this.preset.fadeOutMillis;
  }

  ok() {
    this.preset.name = this.name;
    this.preset.startMillis = this.startMillis;
    this.preset.endMillis = this.endMillis;
    this.preset.fadeInMillis = this.fadeInMillis;
    this.preset.fadeOutMillis = this.fadeOutMillis;

    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

}
