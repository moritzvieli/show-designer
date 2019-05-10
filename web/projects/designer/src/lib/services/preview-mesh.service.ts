import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { Observable, of } from 'rxjs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PreviewMeshService {

  private loader = new GLTFLoader();
  private cachedMeshes = new Map<string, THREE.Mesh>();

  // the observable, if the requested mesh is already being loaded currently
  private cachedObservables = new Map<string, Observable<THREE.Mesh>>();

  constructor() { }

  private loadScene(name: string): Observable<THREE.Scene> {
    return Observable.create(observer => {
      this.loader.load(
        './assets/designer/models/' + name + '.gltf',

        // Called when the resource is loaded
        function (gltf: any) {
          let model = gltf.scene.children[0];
          // console.log(model);

          //model.geometry.center();

          //model.position.set(new THREE.Box3().setFromObject(model).getCenter(model.position).multiplyScalar(-1));


          model.position.set(0, 0, 0);

          observer.next(gltf.scene);
          observer.complete();
        },

        // Called while loading is progressing
        function (xhr: any) { },

        // Called when loading has errors
        function (error: any) {
          observer.error(error);
        }
      );
    });
  }

  private loadMesh(name: string): Observable<THREE.Mesh> {
    let observable = this.loadScene(name).pipe(map((scene: any) => {
      let model = scene.children[0];
      //model.geometry.center();
      //model.position.set(new THREE.Box3().setFromObject(model).getCenter(model.position).multiplyScalar(-1));

      model.position.set(0, 0, 0);

      this.cachedMeshes.set(name, model);
      this.cachedObservables.delete(name);

      return model;
    }));

    this.cachedObservables.set(name, observable);

    return observable;
  }

  getMesh(name: string): Observable<THREE.Mesh> {
    if(this.cachedMeshes.get(name)) {
      return of(this.cachedMeshes.get(name));
    }

    return this.cachedObservables.get(name) || this.loadMesh(name);
  }

}
