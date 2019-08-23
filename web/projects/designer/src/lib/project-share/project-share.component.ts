import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'lib-project-share',
  templateUrl: './project-share.component.html',
  styleUrls: ['./project-share.component.css']
})
export class ProjectShareComponent implements OnInit {

  shareLink: string;

  constructor(
    public bsModalRef: BsModalRef,
    private projectService: ProjectService
  ) { }

  ngOnInit() {
    this.shareLink = window.location.host + '/designer?id=' + this.projectService.project.id + '&token=' + this.projectService.project.shareToken;
  }

  ok() {
    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

}
