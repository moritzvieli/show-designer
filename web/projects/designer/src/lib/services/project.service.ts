import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { UuidService } from './uuid.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  // the current project
  public project: Project;

  constructor(
    private uuidService: UuidService,
    private http: HttpClient,
    private userService: UserService
  ) {
    this.project = new Project();
    this.project.uuid = this.uuidService.getUuid();
    this.project.name = 'New Project';
  }

  save(project: Project): Observable<Object> {
    let id: string = project.id ? project.id : '';
    return this.http.post('project?id=' + id + '&name=' + project.name, JSON.stringify(project), { headers: this.userService.getHeaders() }).pipe(map((response: any) => {
      project.id = response.id;
      return null;
    }));
  }

}
