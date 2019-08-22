import { Component, OnInit } from '@angular/core';
import { Composition } from '../../models/composition';
import { BsModalRef } from 'ngx-bootstrap';
import { TimelineService } from '../../services/timeline.service';
import { Subject } from 'rxjs';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ConfigService } from '../../services/config.service';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { WarningDialogService } from '../../services/warning-dialog.service';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-composition-settings',
  templateUrl: './composition-settings.component.html',
  styleUrls: ['./composition-settings.component.css']
})
export class CompositionSettingsComponent implements OnInit {

  composition: Composition;
  existingCompositionNames: string[] = [];

  public onClose: Subject<number> = new Subject();

  public dropzoneConfig: DropzoneConfigInterface;
  public uploadMessage: string;

  public existingFiles: string[] = [];
  public filteredExistingFiles: string[] = [];

  constructor(
    public bsModalRef: BsModalRef,
    private timelineService: TimelineService,
    public configService: ConfigService,
    private translateService: TranslateService,
    private http: HttpClient,
    private warningDialogService: WarningDialogService,
    private toastrService: ToastrService,
    private projectService: ProjectService
  ) {
  }

  ngOnInit() {
    let projectId = this.projectService.project.id ? this.projectService.project.id : '';
    this.dropzoneConfig = {
      url: this.configService.restUrl + 'file/upload?compositionUuid=' + this.composition.uuid + '&projectId=' + projectId,
      addRemoveLinks: false,
      maxFilesize: 100 /* 100 MB */,
      acceptedFiles: 'audio/*',
      timeout: 0,
      previewTemplate: `
      <div class="dz-preview dz-file-preview">
        <!-- The attachment details -->
        <div class="dz-details" style="text-align: left">
          <i class="fa fa-file-o"></i> <span data-dz-name></span> <small><span class="label label-default file-size" data-dz-size></span></small>
        </div>
        
        <!--div class="mt-5">
          <span data-dz-errormessage></span>
        </div-->
        
        <div class="progress mt-4 mb-1" style="height: 10px">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width:0%;" data-dz-uploadprogress></div>
        </div>
      </div>
      `
    };

    this.translateService.get('designer.timeline.composition-dropzone-message').pipe(map(result => {
      this.uploadMessage = '<h3 class="mb-0"><i class="fa fa-cloud-upload"></i></h3>' + result;
    })).subscribe();

    this.loadFiles();

    if (this.timelineService.externalCompositionsAvailable) {
      this.timelineService.getExternalCompositionNames().subscribe(compositionNames => {
        this.existingCompositionNames = compositionNames;
      });
    }
  }

  ok() {
    this.onClose.next(1);
    this.bsModalRef.hide()
  }

  cancel() {
    this.onClose.next(2);
    this.bsModalRef.hide()
  }

  private getNameFromFile(data: any): string {
    return data.name;
  }

  private loadFiles() {
    if (!this.configService.enableMediaLibrary) {
      return;
    }

    this.http.get('file/list')
      .pipe(map((response: Array<Object>) => {
        this.existingFiles = [];

        for (let file of response) {
          // only load audio files
          if ((<any>file).audioFile) {
            this.existingFiles.push(this.getNameFromFile((<any>file).audioFile));
          }
        }

        this.filterExistingFiles();
      })).subscribe();
  }

  public onUploadError(args: any) {
    let msg = 'designer.timeline.toast-composition-upload-error';
    let title = 'designer.timeline.toast-composition-upload-error-title';
    this.translateService.get([msg, title]).subscribe(result => {
      this.toastrService.error(result[msg] + args[1], result[title], { timeOut: 0, extendedTimeOut: 0, enableHtml: true });
      // Hide the preview element
      args[0].previewElement.hidden = true;
    });
  }

  public onUploadSuccess(args: any) {
    this.loadFiles();

    // Hide the preview element
    args[0].previewElement.hidden = true;

    // Select this file
    this.composition.audioFileName = args[0].name;

    if (this.configService.enableMediaLibrary) {
      // the file has been uploaded to the media library
      this.composition.audioFileInLibrary = true;
    }
  }

  // Filter the existing files
  filterExistingFiles(searchValue?: string) {
    if (!searchValue) {
      this.filteredExistingFiles = this.existingFiles;
      return;
    }

    this.filteredExistingFiles = [];

    for (let file of this.existingFiles) {
      if (file.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1) {
        this.filteredExistingFiles.push(file);
      }
    }
  }

  selectExistingFile(existingFile: string) {
    this.composition.audioFileName = existingFile;

    // the file has been selected from the media library
    this.composition.audioFileInLibrary = true;
  }

  deleteFile(existingFile: string) {
    this.warningDialogService.show('designer.timeline.warning-delete-file').pipe(map(result => {
      if (result) {
        this.http.post('file/delete?name=' + existingFile + '&type=AUDIO', undefined).pipe(map((response: Response) => {
          this.loadFiles();
        })).subscribe();
      }
    })).subscribe();
  }

}
