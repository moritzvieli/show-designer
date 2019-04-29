import { Component, OnInit } from '@angular/core';
import { SceneService } from 'src/app/services/scene.service';
import { PresetService } from 'src/app/services/preset.service';
import { Preset } from 'src/app/models/preset';
import { UuidService } from 'src/app/services/uuid.service';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  constructor(
    public sceneService: SceneService,
    private presetService: PresetService,
    private uuidService: UuidService,
    public projectService: ProjectService
  ) {
    // Add a default scene and preset
    this.sceneService.addScene();

    let preset = new Preset(this.uuidService);
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
