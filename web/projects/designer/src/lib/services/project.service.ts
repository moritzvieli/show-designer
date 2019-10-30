import { Injectable } from '@angular/core';
import { Project } from '../models/project';
import { UuidService } from './uuid.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { map } from 'rxjs/operators';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

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
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private toastrService: ToastrService
  ) {
    this.project = new Project();
    this.project.uuid = this.uuidService.getUuid();
    this.project.name = 'New Project';
  }

  private saveApi(project: Project): Observable<Object> {
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

  save(project: Project) {
    // tries to save the project and returns, whether it has been saved or not
    this.saveApi(project).subscribe(() => {
      let msg = 'designer.project.save-success';
      let title = 'designer.project.save-success-title';

      this.translateService.get([msg, title]).subscribe(result => {
        this.toastrService.success(result[msg], result[title]);
      });

      this.userService.setAutoLoadProject(project);
    }, (response) => {
      let msg = 'designer.project.save-error';
      let title = 'designer.project.save-error-title';
      let error = response && response.error ? response.error.error : 'unknown';

      this.translateService.get([msg, title]).subscribe(result => {
        this.toastrService.error(result[msg] + ' (' + error + ')', result[title]);
      });
    });
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
    return this.http.delete('project?id=' + project.id + '&name=' + project.name, { headers: this.userService.getHeaders() });
  }

  getProject(id: number, name: string, shareToken?: string): Observable<Project> {
    return this.http.get('project?id=' + id + '&name=' + name + '&token=' + shareToken, { headers: this.userService.getHeaders() }).pipe(map((response: any) => {
      let project = new Project(response);
      project.id = id;

      return project;
    }));
  }

}
