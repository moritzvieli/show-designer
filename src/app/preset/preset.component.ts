import { Component, OnInit } from '@angular/core';
import { PresetService } from '../services/preset.service';
import { SceneService } from '../services/scene.service';
import { PreviewService } from '../services/preview.service';

@Component({
  selector: 'app-preset',
  templateUrl: './preset.component.html',
  styleUrls: ['./preset.component.css']
})
export class PresetComponent implements OnInit {

  constructor(
    public presetService: PresetService,
    public sceneService: SceneService,
    public previewService: PreviewService
  ) { }

  ngOnInit() {
  }

  selectPreset(event: any, index: number) {
    this.previewService.previewPreset = true;
    this.presetService.selectPreset(index);
  }

}
