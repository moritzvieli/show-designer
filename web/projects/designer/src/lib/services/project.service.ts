import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { UuidService } from './uuid.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';
import { Params, Router, ActivatedRoute } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  // the current project
  public project: Project;

  constructor(
    private uuidService: UuidService,
    private http: HttpClient,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.project = new Project();
    this.project.uuid = this.uuidService.getUuid();
    this.project.name = 'New Project';
  }

  save(project: Project): Observable<Object> {
    return this.http.post('project', JSON.stringify(project), { headers: this.userService.getHeaders() }).pipe(map((response: any) => {
      if (response) {
        project.id = response.id;
        if (response.shareToken) {
          project.shareToken = response.shareToken;
        }
        const queryParams: Params = {
          id: project.id,
          token: project.shareToken
        };
        this.router.navigate(
          [],
          {
            relativeTo: this.activatedRoute,
            queryParams: queryParams,
            queryParamsHandling: 'merge', // remove to replace all query params by provided
          });
      }
      return null;
    }));
  }

  getAllProjects(): Observable<Project[]> {
    return this.http.get('projects', { headers: this.userService.getHeaders() }).pipe(map((response: any) => {
      let projects: Project[] = []
      for (let project of response) {
        let projectObject = new Project(project);
        projects.push(projectObject);
      }
      return projects;
    }));
  }

  deleteProject(project: Project): Observable<any> {
    return this.http.delete('project?id=' + project.id, { headers: this.userService.getHeaders() });
  }

  getProject(id: number, name: string, shareToken?: string): Observable<Project> {
    return this.http.get('project?id=' + id + '&name=' + name + '&token=' + shareToken, { headers: this.userService.getHeaders() }).pipe(map((response: any) => {
      let project = new Project(response);
      project.id = id;

      return project;
    }));
  }

}
