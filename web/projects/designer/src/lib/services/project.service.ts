import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { UuidService } from './uuid.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  // the current project
  public project: Project;

  constructor(
    private uuidService: UuidService,
    private http: HttpClient
  ) {
    this.project = new Project();
    this.project.uuid = this.uuidService.getUuid();
    this.project.name = 'New Project';
  }

  save(project: Project): Observable<Object> {
    return this.http.post('project', JSON.stringify(project));
  }

}
