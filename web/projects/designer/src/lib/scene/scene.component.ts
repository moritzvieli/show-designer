import { Component, OnInit } from '@angular/core';
import { SceneService } from '../services/scene.service';
import { PresetService } from '../services/preset.service';
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
    public projectService: ProjectService
  ) {
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
