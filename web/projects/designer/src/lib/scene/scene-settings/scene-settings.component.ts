import { Component, OnInit } from '@angular/core';
import { Scene } from '../../models/scene';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'lib-scene-settings',
  templateUrl: './scene-settings.component.html',
  styleUrls: ['./scene-settings.component.css']
})
export class SceneSettingsComponent implements OnInit {

  scene: Scene;

  name: string;
  fadeInMillis: number;
  fadeOutMillis: number;

  constructor(
    public bsModalRef: BsModalRef
  ) {
  }

  ngOnInit() {
    this.name = this.scene.name;
    this.fadeInMillis = this.scene.fadeInMillis;
    this.fadeOutMillis = this.scene.fadeOutMillis;
  }

  ok() {
    this.scene.name = this.name;
    if (!isNaN(this.fadeInMillis) && this.fadeInMillis > 0) {
      this.scene.fadeInMillis = this.fadeInMillis;
    }
    if (!isNaN(this.fadeOutMillis) && this.fadeOutMillis > 0) {
      this.scene.fadeOutMillis = this.fadeOutMillis;
    }

    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

}
