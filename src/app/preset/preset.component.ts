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

  selectPreset(index: number) {
    this.presetService.previewPreset = true;
    this.presetService.selectPreset(index);
  }

  activatePreset(active: boolean, index: number) {
    if (this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1) {
      let uuid = this.presetService.presets[index].uuid;

      if (active) {
        // Activate a new uuid
        this.sceneService.selectedScenes[0].presetUuids.push(uuid);
      } else {
        // Remove the uuid
        for (let i = 0; i < this.sceneService.selectedScenes[0].presetUuids.length; i++) {
          if (this.sceneService.selectedScenes[0].presetUuids[i] == uuid) {
            this.sceneService.selectedScenes[0].presetUuids.splice(i, 1);
            return;
          }
        }
      }
    }
  }

}
