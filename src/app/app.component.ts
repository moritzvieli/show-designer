import { Fixture } from './models/fixture';
import { PreviewComponent } from './preview/preview.component';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import Split from 'split.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  @ViewChild(PreviewComponent)
  previewComponent:PreviewComponent;

  private fixtures: Fixture[] = [];
  private selectedFixtures: Fixture[] = [];

  private onResize() {
    if(this.previewComponent) {
      this.previewComponent.onResize();
    }
  }

  public changeSlider(evt) {
    this.previewComponent.updateSlider(evt.newValue);
  }

  public changePan(evt) {
    this.previewComponent.changePan(evt.newValue);
  }

  ngAfterViewInit(): void {
    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 30, 20],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#preview'], {
      sizes: [30, 70],
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    this.onResize();
  }

}
