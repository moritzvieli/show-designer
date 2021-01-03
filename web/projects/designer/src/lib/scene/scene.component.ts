import { Component, OnInit } from '@angular/core';
import { SceneService } from '../services/scene.service';
import { PresetService } from '../services/preset.service';
import { ProjectService } from '../services/project.service';
import { Scene } from '../models/scene';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SceneSettingsComponent } from './scene-settings/scene-settings.component';
import { IntroService } from '../services/intro.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  constructor(
    public sceneService: SceneService,
    public presetService: PresetService,
    public projectService: ProjectService,
    private modalService: BsModalService,
    public introService: IntroService
  ) {
  }

  ngOnInit() {
  }

  selectScene(event: any, index: number) {
    this.sceneService.selectScene(index);
  }

  removeScene() {
    if (this.sceneService.selectedScenes.length == 0) {
      return;
    }

    this.sceneService.removeScene(this.sceneService.selectedScenes[0]);
  }

  openSettings(scene: Scene) {
    let bsModalRef = this.modalService.show(SceneSettingsComponent, { keyboard: true, ignoreBackdropClick: false, class: '', initialState: { scene: scene } });
  }

}
