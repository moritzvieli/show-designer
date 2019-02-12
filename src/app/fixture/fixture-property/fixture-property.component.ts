import { Component, OnInit } from '@angular/core';
import { SceneService } from 'src/app/services/scene.service';

@Component({
  selector: 'app-fixture-property',
  templateUrl: './fixture-property.component.html',
  styleUrls: ['./fixture-property.component.css']
})
export class FixturePropertyComponent implements OnInit {

  constructor(public sceneService: SceneService) { }

  ngOnInit() {
  }

}
