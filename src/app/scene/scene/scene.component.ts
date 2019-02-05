import { Component, OnInit } from '@angular/core';
import { SceneService } from 'src/app/services/scene.service';
import { Scene } from 'src/app/models/scene';
import { FixtureService } from 'src/app/services/fixture.service';
import { SceneFixtureSettings } from 'src/app/models/scene-fixture-settings';

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

    // Add the base settings for each fixture
    for(let fixture of this.fixtureService.fixtures) {
      let sceneFixtureSettings = new SceneFixtureSettings();
      sceneFixtureSettings.fixture = fixture;
      // Create a new instance of fixture
      sceneFixtureSettings.settings = new (fixture.constructor as any);
      scene.sceneFixtureSettingsList.push(sceneFixtureSettings);
    }

    this.sceneService.scenes.push(scene);
  }

  selectScene(event: any, index: number) {
    this.sceneService.currentSceneIndex = index;
  }

}
