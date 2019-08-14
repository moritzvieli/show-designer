import { Component, OnInit } from '@angular/core';
import { PresetService } from '../services/preset.service';
import { SceneService } from '../services/scene.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-preset',
  templateUrl: './preset.component.html',
  styleUrls: ['./preset.component.css']
})
export class PresetComponent implements OnInit {

  constructor(
    public presetService: PresetService,
    public sceneService: SceneService,
    public projectService: ProjectService
  ) { }

  ngOnInit() {
  }

  selectPreset(index: number) {
    this.presetService.previewPreset = true;
    this.presetService.selectPreset(index);
  }

  enableCheckbox(): boolean {
    return this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1;
  }

  activatePreset(active: boolean, index: number) {
    if (this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1) {
      let uuid = this.projectService.project.presets[index].uuid;

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

  addPreset() {
    this.presetService.addPreset();

    if (this.sceneService.selectedScenes && this.sceneService.selectedScenes.length == 1) {
      this.sceneService.selectedScenes[0].presetUuids.push(this.presetService.selectedPreset.uuid);
    }
  }

  removePreset() {
    if (!this.presetService.selectedPreset) {
      return;
    }

    this.projectService.project.presets.splice(this.projectService.project.presets.indexOf(this.presetService.selectedPreset), 1);
    this.presetService.selectPreset(0);
  }

}
