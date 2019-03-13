import { Component, OnInit } from '@angular/core';
import { PresetService } from '../services/preset.service';
import { SceneService } from '../services/scene.service';

@Component({
  selector: 'app-preset',
  templateUrl: './preset.component.html',
  styleUrls: ['./preset.component.css']
})
export class PresetComponent implements OnInit {

  constructor(
    public presetService: PresetService,
    public sceneService: SceneService
  ) { }

  ngOnInit() {
  }

  selectPreset(event: any, index: number) {
    this.presetService.previewPreset = true;
    this.presetService.selectPreset(index);
  }

}
