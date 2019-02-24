import { Component, OnInit } from '@angular/core';
import { SceneService } from 'src/app/services/scene.service';
import { Scene } from 'src/app/models/scene';
import { EffectService } from 'src/app/services/effect.service';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  multipleSelection: boolean = false;

  constructor(
    public sceneService: SceneService,
    private effectService: EffectService
  ) { }

  ngOnInit() {
  }

  addScene(): void {
    let scene: Scene = new Scene();
    scene.name = 'Test 1';

    // Insert the new scene before the highest currently selected scene
    let highestSelectedSceneIndex = 0;

    for(let i = 0; i < this.sceneService.scenes.length; i++) {
      if(this.sceneService.scenes[i].isSelected) {
        highestSelectedSceneIndex = i;
        break;
      }
    }

    this.sceneService.scenes.splice(highestSelectedSceneIndex, 0, scene);

    this.selectScene(undefined, highestSelectedSceneIndex);
  }

  selectScene(event: any, index: number) {
    this.effectService.selectedEffect = undefined;

    if(this.multipleSelection) {
      this.sceneService.scenes[index].isSelected = !this.sceneService.scenes[index].isSelected;
    } else {
      for(let scene of this.sceneService.scenes) {
        scene.isSelected = false;
      }

      this.sceneService.scenes[index].isSelected = true;
    }

    this.sceneService.currentSceneChanged.next();
  }

}
