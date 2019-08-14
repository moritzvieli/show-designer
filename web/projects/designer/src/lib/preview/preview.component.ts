import { AnimationService } from './../services/animation.service';
import { Positioning } from './../models/fixture';
import { MovingHead3d } from './models/moving-head-3d';
import { FixtureService } from '../services/fixture.service';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import STATS from 'three/examples/js/libs/stats.min';
import { FixtureCategory } from '../models/fixture-profile';
import { Fixture3d } from './models/fixture-3d';
import { PreviewService } from '../services/preview.service';
import { TimelineService } from '../services/timeline.service';
import { ProjectService } from '../services/project.service';
import { PreviewMeshService } from '../services/preview-mesh.service';

// declare var THREEx: any;

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements AfterViewInit {

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  private stats: any = STATS();
  // private rendererStats = new THREEx.RendererStats();

  private stageWidth = 600;
  private stageDepth = 600;
  private stageHeight = 350;

  private stageFloorHeight = 30;
  private stageCeilingHeight = 5;
  private stagePillarWidth = 20;

  private fixtures3d: Fixture3d[] = [];

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  constructor(
    private fixtureService: FixtureService,
    private previewMeshService: PreviewMeshService,
    private animationService: AnimationService,
    private previewService: PreviewService,
    private timelineService: TimelineService,
    private projectService: ProjectService) {

    this.previewService.doUpdateFixtureSetup.subscribe(() => {
      // synchronize the 3d-fixtures to the project fixtures
      this.syncFixtures();
    });
  }

  private syncFixtures() {
    // remove all fixtures
    for (let fixture3d of this.fixtures3d) {
      fixture3d.destroy();
    }
    this.fixtures3d = [];

    // add all fixtures from the project
    for (let fixture of this.fixtureService.cachedFixtures) {
      if (fixture.profile.categories[0] == FixtureCategory['Moving Head']) {
        this.fixtures3d.push(new MovingHead3d(this.fixtureService, this.previewMeshService, fixture, this.scene));
      }
    }
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

    this.projectService.project.fixtures.forEach((element, index) => {
      if (element.positioning == positioning) {
        positionCount++;
      }
    });

    this.projectService.project.fixtures.forEach((element, index) => {
      if (element.positioning == positioning) {
        element.positionX = xMin + (xMax - xMin) / (positionCount + 1) * positionIndex;
        element.positionY = yMin + (yMax - yMin) / (positionCount + 1) * positionIndex;
        element.positionZ = zMin + (zMax - zMin) / (positionCount + 1) * positionIndex;

        positionIndex++;
      }
    });
  }

  private animate(timeMillis: number) {
    this.stats.begin();

    if (this.timelineService.playState == 'playing') {
      // Overwrite the current time with the playing time, if we're in playback mode
      timeMillis = this.timelineService.waveSurfer.getCurrentTime() * 1000;
    }

    this.animationService.timeMillis = timeMillis;

    // Update the controls
    if (this.controls) {
      this.controls.update();
    }

    // Update the positions
    this.updateStagePosition(Positioning.topFront, -this.stageWidth / 2, this.stageWidth / 2, this.stageHeight + this.stageFloorHeight, this.stageHeight + this.stageFloorHeight, this.stageDepth / 2 - 70, this.stageDepth / 2 - 70);
    this.updateStagePosition(Positioning.bottomFront, -this.stageWidth / 2, this.stageWidth / 2, this.stageFloorHeight, this.stageFloorHeight, this.stageDepth / 2 - 70, this.stageDepth / 2 - 70);
    this.updateStagePosition(Positioning.topBack, -this.stageWidth / 2, this.stageWidth / 2, this.stageHeight + this.stageFloorHeight, this.stageHeight + this.stageFloorHeight, -this.stageDepth / 2 + 70, -this.stageDepth / 2 + 70);
    this.updateStagePosition(Positioning.bottomBack, -this.stageWidth / 2, this.stageWidth / 2, this.stageFloorHeight, this.stageFloorHeight, -this.stageDepth / 2 + 70, -this.stageDepth / 2 + 70);

    // Update all fixtures and apply the preview properties, if available
    // TODO Update the fixtures only e.g. 40 times per second according to the "real" refresh rate of the DMX interface?
    let presets = this.previewService.getPresets(timeMillis);

    let calculatedFixtures = this.previewService.getChannelValues(timeMillis, presets);

    for (let fixture3d of this.fixtures3d) {
      // Update the fixture properties
      fixture3d.updatePreview(calculatedFixtures.get(fixture3d.fixture) || [], this.projectService.project.masterDimmerValue);

      // Select the fixture, if required
      fixture3d.isSelected = this.previewService.fixtureIsSelected(fixture3d.fixture.fixture.uuid, presets);
    }

    // TODO enable for monitoring the DMX universes
    this.previewService.setUniverseValues(calculatedFixtures, this.projectService.project.masterDimmerValue);

    // Update the statistics
    // this.rendererStats.update(this.renderer);

    // Render the scene
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

  @HostListener('window:resize')
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
    this.renderer.shadowMap.enabled = false;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(-600, 80, 700);
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableKeys = false;
    this.controls.rotateSpeed = 0.05;
    this.controls.zoomSpeed = 1.2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 700;
    //this.controls.zoom = 1000;
    this.controls.maxDistance = 2000
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(0, 200, 0);
    //this.controls.rotation = 100;
  }

  private setupFloor() {
    let width = 4000;
    let height = 1;

    let geometry = new THREE.BoxGeometry(width, height, width);

    // let texture = new THREE.TextureLoader().load('./assets/textures/planks.jpg');
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(10, 10);
    //let floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

    // let material = new THREE.MeshLambertMaterial({
    //   color: 0x0d0d0d,
    //   emissive: 0x0d0d0d,
    // });

    let material = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, });

    let floor = new THREE.Mesh(geometry.clone(), material);
    floor.receiveShadow = false;
    floor.castShadow = false;
    floor.position.set(0, -height / 2, 0);
    this.scene.add(floor);
  }

  private setupStage() {
    // Load the stage
    // this.loadScene('stage').subscribe((scene) => {
    //   // TODO Too heavy for the stage?
    //   // let path = './assets/textures/SwedishRoyalCastle/';
    //   // let format = '.jpg';
    //   // let urls = [
    //   //   path + 'px' + format, path + 'nx' + format,
    //   //   path + 'py' + format, path + 'ny' + format,
    //   //   path + 'pz' + format, path + 'nz' + format
    //   // ];

    //   // var reflectionCube = new THREE.CubeTextureLoader().load(urls);

    //   // let material = new THREE.MeshStandardMaterial({
    //   //   color: 0xffffff,
    //   //   roughness: 0.07,
    //   //   metalness: 1,
    //   //   envMap: reflectionCube,
    //   //   envMapIntensity: 1.4
    //   // });

    //   // let material = new THREE.MeshLambertMaterial({
    //   //   color: 0x0d0d0d,
    //   //   emissive: 0x0d0d0d
    //   // });

    //   let material = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, });

    //   //let material = new THREE.MeshPhongMaterial( { color: 0x0d0d0d, dithering: true } );

    //   scene.children.forEach(element => {
    //     element.material = material;
    //   });

    //   scene.scale.multiplyScalar(3)

    //   this.scene.add(scene);
    // });

    // Global floor has a height of 1
    let material = new THREE.MeshStandardMaterial({ color: 0x0d0d0d, });
    var geometry: any;
    let mesh: any;

    // Floor
    geometry = new THREE.BoxBufferGeometry(this.stageWidth, this.stageFloorHeight, this.stageDepth);
    mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.set(0, this.stageFloorHeight / 2, 0);
    this.scene.add(mesh);

    // Pillar front left
    geometry = new THREE.BoxBufferGeometry(this.stagePillarWidth, this.stageHeight, this.stagePillarWidth);
    mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.set(-this.stageWidth / 2 + this.stagePillarWidth / 2, this.stageHeight / 2 + this.stageFloorHeight, this.stageWidth / 2 - this.stagePillarWidth / 2);
    this.scene.add(mesh);

    // Pillar front right
    geometry = new THREE.BoxBufferGeometry(this.stagePillarWidth, this.stageHeight, this.stagePillarWidth);
    mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.set(this.stageWidth / 2 - this.stagePillarWidth / 2, this.stageHeight / 2 + this.stageFloorHeight, this.stageWidth / 2 - this.stagePillarWidth / 2);
    this.scene.add(mesh);

    // Pillar back left
    geometry = new THREE.BoxBufferGeometry(this.stagePillarWidth, this.stageHeight, this.stagePillarWidth);
    mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.set(-this.stageWidth / 2 + this.stagePillarWidth / 2, this.stageHeight / 2 + this.stageFloorHeight, -this.stageWidth / 2 + this.stagePillarWidth / 2);
    this.scene.add(mesh);

    // Pillar back right
    geometry = new THREE.BoxBufferGeometry(this.stagePillarWidth, this.stageHeight, this.stagePillarWidth);
    mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.set(this.stageWidth / 2 - this.stagePillarWidth / 2, this.stageHeight / 2 + this.stageFloorHeight, -this.stageWidth / 2 + this.stagePillarWidth / 2);
    this.scene.add(mesh);

    // Ceiling
    geometry = new THREE.BoxBufferGeometry(this.stageWidth, this.stageCeilingHeight, this.stageDepth);
    mesh = new THREE.Mesh(geometry.clone(), material);
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.position.set(0, this.stageHeight + this.stageCeilingHeight / 2 + this.stageFloorHeight, 0);
    this.scene.add(mesh);
  }

  private setupStats() {
    // this.rendererStats.domElement.style.position = 'absolute';
    // this.rendererStats.domElement.style.left = '0px';
    // this.rendererStats.domElement.style.bottom = '0px';
    // this.canvas.appendChild(this.rendererStats.domElement);

    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.left = '0px';
    this.canvas.appendChild(this.stats.domElement);
  }

  private setupScene() {
    // Create a new scene
    this.scene = new THREE.Scene();

    // Add a little bit of ambient light
    let ambient = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambient);

    // Add a floor
    this.setupFloor();

    // Create the stage
    this.setupStage();

    // TODO
    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 0.5, 0);
    lights[1] = new THREE.PointLight(0xffffff, 0.5, 0);
    lights[2] = new THREE.PointLight(0xffffff, 0.5, 0);

    lights[0].position.set(0, 2000, 0);
    lights[1].position.set(1000, 2000, 1000);
    lights[2].position.set(- 1000, - 2000, - 1000);

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
