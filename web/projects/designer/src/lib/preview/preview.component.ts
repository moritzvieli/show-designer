import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FixtureCategory } from '../models/fixture-profile';
import { FixtureService } from '../services/fixture.service';
import { PreviewMeshService } from '../services/preview-mesh.service';
import { PreviewService } from '../services/preview.service';
import { ProjectService } from '../services/project.service';
import { TimelineService } from '../services/timeline.service';
import { Positioning } from './../models/fixture';
import { AnimationService } from './../services/animation.service';
import { ColorChanger3d } from './models/color-changer-3d';
import { Fixture3d } from './models/fixture-3d';
import { MovingHead3d } from './models/moving-head-3d';

@Component({
  selector: 'lib-app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css'],
})
export class PreviewComponent implements AfterViewInit {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  private fixtures3d: Fixture3d[] = [];

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  constructor(
    private fixtureService: FixtureService,
    private previewMeshService: PreviewMeshService,
    private animationService: AnimationService,
    private previewService: PreviewService,
    private timelineService: TimelineService,
    private projectService: ProjectService
  ) {
    this.previewService.doUpdateFixtureSetup.subscribe(() => {
      this.syncFixtures();
    });
    this.syncFixtures();
  }

  // synchronize the 3d-fixtures to the project fixtures
  private syncFixtures() {
    if (!this.previewService.scene) {
      return;
    }

    // remove all fixtures
    for (const fixture3d of this.fixtures3d) {
      fixture3d.destroy();
    }
    this.fixtures3d = [];

    // add all fixtures from the project
    for (const fixture of this.fixtureService.cachedFixtures) {
      switch (fixture.profile.categories[0]) {
        case FixtureCategory['Moving Head']:
          this.fixtures3d.push(new MovingHead3d(this.fixtureService, this.previewMeshService, fixture, this.scene));
          break;
        case FixtureCategory['Color Changer']:
          this.fixtures3d.push(new ColorChanger3d(this.fixtureService, this.previewMeshService, fixture, this.scene));
          break;
        case FixtureCategory['Blinder']:
          this.fixtures3d.push(new ColorChanger3d(this.fixtureService, this.previewMeshService, fixture, this.scene));
          break;
      }
    }
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private updateStagePosition(
    positioning: Positioning,
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    zMin: number,
    zMax: number
  ) {
    let positionCount = 0; // Number of fixtures in the same position
    let positionIndex = 1;

    this.projectService.project.presetFixtures.forEach((element, index) => {
      const fixture = this.fixtureService.getFixtureByUuid(element.fixtureUuid);
      if (fixture.positioning === positioning) {
        positionCount++;
      }
    });

    this.projectService.project.presetFixtures.forEach((element, index) => {
      const fixture = this.fixtureService.getFixtureByUuid(element.fixtureUuid);
      if (fixture.positioning === positioning) {
        fixture.positionX = xMin + ((xMax - xMin) / (positionCount + 1)) * positionIndex;
        fixture.positionY = yMin + ((yMax - yMin) / (positionCount + 1)) * positionIndex;
        fixture.positionZ = zMin + ((zMax - zMin) / (positionCount + 1)) * positionIndex;

        positionIndex++;
      }
    });
  }

  private animate(timeMillis: number) {
    if (this.timelineService.playState === 'playing') {
      // Overwrite the current time with the playing time, if we're in playback mode
      timeMillis = this.timelineService.waveSurfer.getCurrentTime() * 1000;
    }

    this.animationService.timeMillis = timeMillis;

    // Update the controls
    if (this.controls) {
      this.controls.update();
    }

    // Update the positions
    this.updateStagePosition(
      Positioning.topFront,
      -this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageHeightCm + this.projectService.project.stageFloorHeightCm,
      this.projectService.project.stageHeightCm + this.projectService.project.stageFloorHeightCm,
      this.projectService.project.stageDepthCm / 2 - 70,
      this.projectService.project.stageDepthCm / 2 - 70
    );
    this.updateStagePosition(
      Positioning.bottomFront,
      -this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageFloorHeightCm,
      this.projectService.project.stageFloorHeightCm,
      this.projectService.project.stageDepthCm / 2 - 70,
      this.projectService.project.stageDepthCm / 2 - 70
    );
    this.updateStagePosition(
      Positioning.topBack,
      -this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageHeightCm + this.projectService.project.stageFloorHeightCm,
      this.projectService.project.stageHeightCm + this.projectService.project.stageFloorHeightCm,
      -this.projectService.project.stageDepthCm / 2 + 70,
      -this.projectService.project.stageDepthCm / 2 + 70
    );
    this.updateStagePosition(
      Positioning.bottomBack,
      -this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageWidthCm / 2,
      this.projectService.project.stageFloorHeightCm,
      this.projectService.project.stageFloorHeightCm,
      -this.projectService.project.stageDepthCm / 2 + 70,
      -this.projectService.project.stageDepthCm / 2 + 70
    );

    // Update all fixtures and apply the preview properties, if available
    // TODO Update the fixtures only e.g. 40 times per second according to the "real" refresh rate of the DMX interface?
    const presets = this.previewService.getPresets(timeMillis);

    const calculatedFixtures = this.previewService.getChannelValues(timeMillis, presets);

    for (const fixture3d of this.fixtures3d) {
      // Update the fixture properties
      fixture3d.updatePreview(calculatedFixtures.get(fixture3d.fixture) || [], this.projectService.project.masterDimmerValue);

      // Select the fixture, if required
      if (this.fixtureService.settingsSelection) {
        fixture3d.isSelected = this.fixtureService.settingsFixtureIsSelected(fixture3d.fixture.fixture);
      } else {
        fixture3d.isSelected = this.previewService.fixtureIsSelected(fixture3d.fixture.fixture.uuid, fixture3d.fixture.pixelKey, presets);
      }
    }

    // Render the scene
    this.render();

    requestAnimationFrame(this.animate.bind(this));
  }

  private getAspectRatio(): number {
    const height = this.canvas.clientHeight;

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
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.gammaInput = true;
    // this.renderer.gammaOutput = true;
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
    // this.controls.zoom = 1000;
    this.controls.maxDistance = 2000;
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(0, 200, 0);
    // this.controls.rotation = 100;
  }

  private setupScene() {
    // Create a new scene
    this.scene = new THREE.Scene();
    // this.scene.background = new THREE.Color(0x080808);
    // this.scene.fog	= new THREE.FogExp2( 0x000000, 0.1 );

    this.previewService.scene = this.scene;

    // Add a little bit of ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 1.8);
    this.scene.add(ambient);

    // Create the stage dimensions
    this.previewService.updateStage();

    const lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 2, 0, 0.1);
    lights[1] = new THREE.PointLight(0xffffff, 2, 0, 0.1);
    lights[2] = new THREE.PointLight(0xffffff, 2, 0, 0.1);

    lights[0].position.set(0, 2000, 0);
    lights[1].position.set(1000, 2000, 1000);
    lights[2].position.set(-1000, -2000, -1000);

    lights[0].castShadow = true;
    lights[1].castShadow = true;
    lights[2].castShadow = true;

    this.scene.add(lights[0]);
    this.scene.add(lights[1]);
    this.scene.add(lights[2]);

    this.previewService.updateFixtureSetup();
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
