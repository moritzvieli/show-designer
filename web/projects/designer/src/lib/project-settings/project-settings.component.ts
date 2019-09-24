import { Component, OnInit, HostListener } from '@angular/core';
import { Project } from '../models/project';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'lib-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.css']
})
export class ProjectSettingsComponent implements OnInit {

  project: Project;

  name: string;

  constructor(
    public bsModalRef: BsModalRef
  ) {
  }

  ngOnInit() {
    this.name = this.project.name;
  }

  ok() {
    this.project.name = this.name;

    this.bsModalRef.hide();
  }

  cancel() {
    this.bsModalRef.hide();
  }

  @HostListener('document:keydown.enter', ['$event'])
  handleKeyboardEvent(event: any) {
    this.ok();
  }

}
