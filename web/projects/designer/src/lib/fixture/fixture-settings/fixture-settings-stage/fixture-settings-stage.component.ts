import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProjectService } from '../../../services/project.service';
import { PreviewService } from '../../../services/preview.service';

@Component({
  selector: 'app-fixture-settings-stage',
  templateUrl: './fixture-settings-stage.component.html',
  styleUrls: ['./fixture-settings-stage.component.css']
})
export class FixtureSettingsStageComponent implements OnInit {

  constructor(
    public projectService: ProjectService,
    public previewService: PreviewService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  update() {
    this.previewService.updateStage();
    this.changeDetectorRef.detectChanges();
  }

}
