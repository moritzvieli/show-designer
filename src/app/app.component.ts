import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import Split from 'split.js';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FixturePoolComponent } from './fixture-pool/fixture-pool.component';
import { SceneService } from './services/scene.service';
import { FixtureService } from './services/fixture.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  currentTab: string = 'properties';

  @ViewChild(PreviewComponent)
  previewComponent: PreviewComponent;

  constructor(
    private translateService: TranslateService,
    private modalService: BsModalService,
    private sceneService: SceneService,
    private fixtureService: FixtureService
  ) {

    this.translateService.use('en');
  }

  private onResize() {
    if (this.previewComponent) {
      this.previewComponent.onResize();
    }
  }

  ngAfterViewInit(): void {
    // Set up the splitter
    let gutterSize: number = 12.8;

    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 31, 19],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#presets', '#preview'], {
      sizes: [15, 15, 70],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    Split(['#properties', '#fixtures'], {
      sizes: [80, 20],
      snapOffset: 0,
      gutterSize: gutterSize,
      onDrag: this.onResize.bind(this)
    });

    this.onResize();
  }

  openTab(tab: string) {
    if (tab == 'properties' && this.currentTab != 'properties') {
      // TODO Also do this on scene switching

      // Update the fixture-selection (if only one scene is selected)
      if (this.sceneService.getSelectedScenes().length == 1) {
        for (let scene of this.sceneService.getSelectedScenes()) {
          for (let fixture of this.fixtureService.fixtures) {
            fixture.isSelected = this.sceneService.hasfixturePropertiesInScene(scene, fixture);
          }
        }
      }
    }

    // TODO settings selection?

    this.currentTab = tab;
  }

  openFixturePool() {
    let bsModalRef = this.modalService.show(FixturePoolComponent, { class: 'modal-lg' });
  }

}
