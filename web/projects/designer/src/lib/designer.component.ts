import { Component, ViewEncapsulation, OnInit, Input } from '@angular/core';
import { TimelineService } from './services/timeline.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'lib-designer',
  templateUrl: './designer.component.html',
  styleUrls: ['./designer.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DesignerComponent implements OnInit {

  @Input()
  set menuHeightPx(value: number) {
    this.configService.menuHeightPx = value;
    this.configService.menuHeightChanged.next();
  }

  @Input()
  set externalCompositionsAvailable(value: boolean) {
    this.timelineService.externalCompositionsAvailable = value;
  }

  @Input()
  set restUrl(value: string) {
    this.configService.restUrl = value;
  }

  @Input()
  set enableMediaLibrary(value: boolean) {
    this.configService.enableMediaLibrary = value;
  }

  @Input()
  set loginAvailable(value: boolean) {
    this.configService.loginAvailable = value;
  }

  @Input()
  set shareAvailable(value: boolean) {
    this.configService.shareAvailable = value;
  }

  @Input()
  set languageSwitch(value: boolean) {
    this.configService.languageSwitch = value;
  }

  constructor(
    private timelineService: TimelineService,
    private configService: ConfigService
  ) {
  }

  ngOnInit() {
  }

}
