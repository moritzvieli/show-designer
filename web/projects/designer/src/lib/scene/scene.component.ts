import { Component, OnInit } from '@angular/core';
import { SceneService } from '../services/scene.service';
import { PresetService } from '../services/preset.service';
import { Preset } from '../models/preset';
import { UuidService } from '../services/uuid.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  constructor(
    public sceneService: SceneService,
    public presetService: PresetService,
    private uuidService: UuidService,
    public projectService: ProjectService
  ) {
    // Add a default scene and preset
    this.sceneService.addScene();

    let preset = new Preset();
    preset.uuid = this.uuidService.getUuid();
    preset.name = 'Preset';
    this.projectService.project.scenes[0].presetUuids.push(preset.uuid);

    this.projectService.project.presets.push(preset);

    this.presetService.selectedPreset = preset;
  }

  ngOnInit() {
  }

  selectScene(event: any, index: number) {
    this.sceneService.selectScene(index);
  }

  removeScene() {
    // TODO
  }

}
