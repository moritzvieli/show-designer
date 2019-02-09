import { Component, OnInit } from '@angular/core';
import { SceneService } from 'src/app/services/scene.service';
import { Scene } from 'src/app/models/scene';
import { FixtureService } from 'src/app/services/fixture.service';
import { SceneFixtureProperties } from 'src/app/models/scene-fixture-properties';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.css']
})
export class SceneComponent implements OnInit {

  constructor(
    public sceneService: SceneService,
    private fixtureService: FixtureService
  ) { }

  ngOnInit() {
  }

  addScene(): void {
    let scene: Scene = new Scene();
    scene.name = 'Test 1';

    // Add the base properties for each fixture
    for(let fixture of this.fixtureService.fixtures) {
      let sceneFixtureProperties = new SceneFixtureProperties();
      sceneFixtureProperties.fixture = fixture;
      // Create a new instance of fixture
      sceneFixtureProperties.properties = new (fixture.constructor as any);
      scene.sceneFixturePropertiesList.push(sceneFixtureProperties);
    }

    this.sceneService.scenes.push(scene);
  }

  selectScene(event: any, index: number) {
    this.sceneService.currentSceneIndex = index;
  }

}
