import { Component, OnInit } from '@angular/core';
import { SceneService } from 'src/app/services/scene.service';
import { Scene } from 'src/app/models/scene';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  multipleSelection: boolean = false;

  constructor(
    public sceneService: SceneService
  ) { }

  ngOnInit() {
  }

  addScene(): void {
    let scene: Scene = new Scene();
    scene.name = 'Test 1';

    this.sceneService.scenes.push(scene);

    this.selectScene(undefined, this.sceneService.scenes.length - 1);
  }

  selectScene(event: any, index: number) {
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
