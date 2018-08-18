import { Positioning } from './../models/fixture';
import { IFixture3d } from './models/i-fixture-3d';
import { MovingHead3d } from './models/moving-head-3d';
import { FixtureService } from '../services/fixture.service';
import { MovingHead } from '../models/moving-head';
import { Fixture } from '../models/fixture';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import * as THREE from 'three';
import './js/EnableThreeExamples';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import * as STATS from 'three/examples/js/libs/stats.min';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

declare var THREEx: any;

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements AfterViewInit {

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public controls: THREE.OrbitControls;
  private loader = new THREE.GLTFLoader();

  private stats: any = STATS();
  private rendererStats = new THREEx.RendererStats();

  private fixtures3d: IFixture3d[] = [];

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  constructor(private fixtureService: FixtureService) {
    this.fixtureService.fixtureAdded.subscribe((fixture: Fixture) => {
      if (fixture instanceof MovingHead) {
        forkJoin(
          this.loadMesh('moving_head_socket'),
          this.loadMesh('moving_head_arm'),
          this.loadMesh('moving_head_head')
        ).pipe(map(([socket, arm, head]) => {
          this.fixtures3d.push(new MovingHead3d(fixture, this.scene, this.camera, socket, arm, head));
        })).subscribe();
      }
    });
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private updateStagePosition(positioning: Positioning, xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number) {
    let positionCount: number = 0; // Number of fixtures in the same position
    let positionIndex: number = 1;

    this.fixtureService.fixtures.forEach((element, index) => {
      if (element.positioning == positioning) {
        positionCount++;
      }
    });

    this.fixtureService.fixtures.forEach((element, index) => {
      if (element.positioning == positioning) {
        element.positionX = xMin + (xMax - xMin) / (positionCount + 1) * positionIndex;
        element.positionY = yMin + (yMax - yMin) / (positionCount + 1) * positionIndex;
        element.positionZ = zMin + (zMax - zMin) / (positionCount + 1) * positionIndex;

        positionIndex++;
      }
    });
  }

  private animate(timeMillis) {
    this.stats.begin();

    if (this.controls) {
      this.controls.update();
    }

    // Update the positions
    this.updateStagePosition(Positioning.topFront, -22, 13, 32, 32, 15, 15);
    // TODO All other stage positioning options

    // Update the 3d objects
    this.fixtures3d.forEach((element, index) => {
      element.update(timeMillis, index);
    });

    this.rendererStats.update(this.renderer);

    this.render();

    this.stats.end();

    requestAnimationFrame(this.animate.bind(this));
  }

  private getAspectRatio(): number {
    let height = this.canvas.clientHeight;

    if (height === 0) {
      return 0;
    }

    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private loadScene(name: string): Observable<THREE.Scene> {
    return Observable.create(observer => {
      this.loader.load(
        './assets/models/' + name + '.gltf',

        // Called when the resource is loaded
        function (gltf) {
          let model = gltf.scene.children[0];
          model.geometry.center();
          model.position.set(0, 0, 0);

          observer.next(gltf.scene);
          observer.complete();
        },

        // Called while loading is progressing
        function (xhr) { },

        // // Called when loading has errors
        function (error) {
          observer.error(error);
        }
      );
    });
  }

  private loadMesh(name: string): Observable<THREE.Mesh> {
    return this.loadScene(name).pipe(map((scene: THREE.Scene) => {
      let model = scene.children[0];
      model.geometry.center();
      model.position.set(0, 0, 0);

      return model;
    }));
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  private setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.canvas.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(-60, 8, 70);
  }

  private setupControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 0.05;
    this.controls.zoomSpeed = 1.2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 70;
    this.controls.zoom = 100;
    this.controls.maxDistance = 200
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(0, 20, 0);
    this.controls.rotation = 10;
  }

  private setupFloor() {
    let geometry = new THREE.BoxGeometry(20, 0.1, 20, 20, 1, 20);

    let texture = new THREE.TextureLoader().load('./assets/textures/planks.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    let floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

    let material = new THREE.MeshLambertMaterial({
      color: 0x0d0d0d,
      emissive: 0x0d0d0d
    });

    let floor = new THREE.Mesh(geometry.clone(), material);
    floor.receiveShadow = true
    floor.castShadow = true
    floor.scale.multiplyScalar(200)
    floor.position.set(0, -geometry.parameters.height / 2 * 200, 0)
    this.scene.add(floor);
  }

  public updateSlider(val) {
    this.fixtures3d.forEach(element => {
      if (element instanceof MovingHead3d) {
        let movingHead3d = <MovingHead3d>element;
        movingHead3d.movingHead.tilt = val;
      }
    });
  }

  public changePan(val) {
    this.fixtures3d.forEach(element => {
      if (element instanceof MovingHead3d) {
        let movingHead3d = <MovingHead3d>element;
        movingHead3d.movingHead.pan = val;
      }
    });
  }

  private setupStage() {
    // Add a floor
    this.setupFloor();

    // Load the stage
    this.loadScene('stage').subscribe((scene) => {
      // TODO Too heavy for the stage?
      // let path = './assets/textures/SwedishRoyalCastle/';
      // let format = '.jpg';
      // let urls = [
      //   path + 'px' + format, path + 'nx' + format,
      //   path + 'py' + format, path + 'ny' + format,
      //   path + 'pz' + format, path + 'nz' + format
      // ];

      //var reflectionCube = new THREE.CubeTextureLoader().load(urls);

      // let material = new THREE.MeshStandardMaterial({
      //   color: 0xffffff,
      //   roughness: 0.07,
      //   metalness: 1,
      //   envMap: reflectionCube,
      //   envMapIntensity: 1.4
      // });

      // let material = new THREE.MeshaaaaMaterial({
      //   color: 0xa8a7c7,
      //   roughness: 0.07,
      //   metalness: 1,
      // });

      let material = new THREE.MeshLambertMaterial({
        color: 0x0d0d0d,
        emissive: 0x0d0d0d
      });

      scene.children.forEach(element => {
        element.material = material;
      });

      scene.scale.multiplyScalar(3)

      this.scene.add(scene);
    });
  }

  private setupStats() {
    this.rendererStats.domElement.style.position = 'absolute'
    this.rendererStats.domElement.style.left = '0px'
    this.rendererStats.domElement.style.bottom = '0px'
    this.canvas.appendChild(this.rendererStats.domElement)

    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.left = '0px'
    this.canvas.appendChild(this.stats.domElement)
  }

  private setupScene() {
    // Create a new scene
    this.scene = new THREE.Scene();

    // Add a little bit of ambient light
    let ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    // Create the stage
    this.setupStage();

    // TODO
    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);

    lights[0].position.set(0, 200, 0);
    lights[1].position.set(100, 200, 100);
    lights[2].position.set(- 100, - 200, - 100);

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);

    // Create the stats
    this.setupStats();
  }

  ngAfterViewInit(): void {
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupScene();

    this.onResize();
    this.animate(null);
  }

}
