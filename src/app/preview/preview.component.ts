import { AnimationService } from './../services/animation.service';
import { Positioning } from './../models/fixture';
import { MovingHead3d } from './models/moving-head-3d';
import { FixtureService } from '../services/fixture.service';
import { Fixture } from '../models/fixture';
import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import './js/EnableThreeExamples';
import 'three/examples/js/controls/OrbitControls';
import 'three/examples/js/loaders/GLTFLoader';
import * as STATS from 'three/examples/js/libs/stats.min';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { SceneService } from '../services/scene.service';
import { EffectChannel } from '../models/effect';
import { TimelineService } from '../services/timeline.service';
import { Scene } from '../models/scene';
import { FixtureTemplate, FixtureType } from '../models/fixture-template';
import { UniverseService } from '../services/universe.service';
import { FixturePropertyValue } from '../models/fixture-property-value';
import { Universe } from '../models/universe';
import { FixtureMode } from '../models/fixture-mode';
import { Fixture3d } from './models/fixture-3d';
import { FixturePropertyType } from '../models/fixture-property';
import { PresetService } from '../services/preset.service';

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
    private animationService: AnimationService,
    private sceneService: SceneService,
    private timelineService: TimelineService,
    private universeService: UniverseService,
    private presetService: PresetService) {

    this.fixtureService.fixtureAdded.subscribe((fixture: Fixture) => {
      let template: FixtureTemplate = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);

      if (template.type == FixtureType.movingHead) {
        forkJoin(
          this.loadMesh('moving_head_socket'),
          this.loadMesh('moving_head_arm'),
          this.loadMesh('moving_head_head')
        ).pipe(map(([socket, arm, head]) => {
          this.fixtures3d.push(new MovingHead3d(fixture, template, this.scene, socket, arm, head));
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

  private alreadyCalculatedFixture(fixtures: Fixture[], index: number): Fixture {
    // Has this fixture already been calculated (same universe and dmx start address as a fixture before)
    // --> return it
    for (let i = 0; i < index; i++) {
      if (fixtures[i].universeUuid == fixtures[index].universeUuid && fixtures[i].firstChannel == fixtures[index].firstChannel) {
        return fixtures[i];
      }
    }

    return undefined;
  }

  private addEffectProperties(value: number, property: FixturePropertyType, propertyFine: FixturePropertyType): FixturePropertyValue[] {
    let effectPropertyValues: FixturePropertyValue[] = [];
    let effectPropertyValue: FixturePropertyValue;

    effectPropertyValue = new FixturePropertyValue();
    effectPropertyValue.fixturePropertyType = property;
    effectPropertyValue.value = this.presetService.roundDmx(value);
    effectPropertyValues.push(effectPropertyValue);

    effectPropertyValue = new FixturePropertyValue();
    effectPropertyValue.fixturePropertyType = propertyFine;
    effectPropertyValue.value = this.presetService.getDmxFineValue(value);
    effectPropertyValues.push(effectPropertyValue);

    return effectPropertyValues;
  }

  private animate(timeMillis: number) {
    this.stats.begin();

    // TODO Update effects and so on only 20 times per second according to the "real"
    // refresh rate of the fixture?

    this.animationService.timeMillis = timeMillis;

    if (this.controls) {
      this.controls.update();
    }

    // Update the positions
    this.updateStagePosition(Positioning.topFront, -this.stageWidth / 2, this.stageWidth / 2, this.stageHeight + this.stageFloorHeight, this.stageHeight + this.stageFloorHeight, this.stageDepth / 2 - 70, this.stageDepth / 2 - 70);
    this.updateStagePosition(Positioning.bottomFront, -this.stageWidth / 2, this.stageWidth / 2, this.stageFloorHeight, this.stageFloorHeight, this.stageDepth / 2 - 70, this.stageDepth / 2 - 70);
    this.updateStagePosition(Positioning.topBack, -this.stageWidth / 2, this.stageWidth / 2, this.stageHeight + this.stageFloorHeight, this.stageHeight + this.stageFloorHeight, -this.stageDepth / 2 + 70, -this.stageDepth / 2 + 70);
    this.updateStagePosition(Positioning.bottomBack, -this.stageWidth / 2, this.stageWidth / 2, this.stageFloorHeight, this.stageFloorHeight, -this.stageDepth / 2 + 70, -this.stageDepth / 2 + 70);

    // Get relevant scenes
    let scenes: Scene[];

    if (this.timelineService.playState == 'playing') {
      // Overwrite the current time with the playing time, if we're in playback mode
      timeMillis = this.timelineService.waveSurfer.getCurrentTime() * 1000;

      // Only use scenes with a current region
      scenes = this.sceneService.getScenesInTime(timeMillis);
    } else {
      // Use all selected scenes
      scenes = this.sceneService.selectedScenes;
    }

    // #### CALCULATE THE DMX UNIVERSES. THE SAME CODE RUNS IN THE BACKEND. ####
    // Reset all DMX universes
    for (let universe of this.universeService.universes) {
      universe.channelValues = [];
      for (let i = 0; i < 512; i++) {
        universe.channelValues.push(0);
      }
    }

    // Loop over all relevant presets and calc the property values from the presets (properties and effects)
    // Loop in reverse order to give higher elements a higher prio
    let calculatedFixtures = new Map<string, FixturePropertyValue[]>();

    for (let sceneIndex = scenes.length - 1; sceneIndex >= 0; sceneIndex--) {
      for (let presetIndex = scenes[sceneIndex].presets.length - 1; presetIndex >= 0; presetIndex--) {
        // Translate the preset into DMX values in the corresponding universes

        let preset = scenes[sceneIndex].presets[presetIndex];

        for (let fixtureIndex = 0; fixtureIndex < preset.fixtures.length; fixtureIndex++) {
          // Only relevant for the 3d-preview
          let previewProperties: FixturePropertyValue[] = [];
          let alreadyCalculatedFixture = this.alreadyCalculatedFixture(preset.fixtures, fixtureIndex);

          if (alreadyCalculatedFixture) {
            // Only relevant for the preview --> reuse all calculated values
            previewProperties.concat(calculatedFixtures.get(alreadyCalculatedFixture.uuid));
          } else {
            let fixture = preset.fixtures[fixtureIndex];
            let template: FixtureTemplate = this.fixtureService.getTemplateByUuid(fixture.fixtureTemplateUuid);
            let mode: FixtureMode = this.fixtureService.getModeByUuid(fixture.modeUuid, template);
            let universe: Universe = this.universeService.getUniverseByUuid(fixture.universeUuid);

            // Match all property values in this preset with the fixture properties
            for (let fixturePropertyIndex = 0; fixturePropertyIndex < mode.fixtureProperties.length; fixturePropertyIndex++) {
              for (let presetProperty of preset.fixturePropertyValues) {
                if (mode.fixtureProperties[fixturePropertyIndex].type == presetProperty.fixturePropertyType) {
                  presetProperty.value = this.presetService.roundDmx(presetProperty.value);
                  universe.channelValues[fixture.firstChannel + fixturePropertyIndex] = presetProperty.value;
                  previewProperties.push(presetProperty);
                }
              }
            }

            // Match all effect properties of this preset with the fixture properties
            for (let effect of preset.effects) {
              let effectPropertyValues: FixturePropertyValue[] = [];
              let value = effect.getValueAtMillis(fixtureIndex);

              switch (+effect.effectChannel) {
                case EffectChannel.colorRed:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.colorRed, FixturePropertyType.colorRedFine));
                  break;
                case EffectChannel.colorGreen:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.colorGreen, FixturePropertyType.colorGreenFine));
                  break;
                case EffectChannel.colorBlue:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.colorBlue, FixturePropertyType.colorBlueFine));
                  break;
                case EffectChannel.pan:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.pan, FixturePropertyType.panFine));
                  break;
                case EffectChannel.tilt:
                  effectPropertyValues.concat(this.addEffectProperties(value, FixturePropertyType.tilt, FixturePropertyType.tiltFine));
                  break;
              }

              for (let fixturePropertyIndex = 0; fixturePropertyIndex < mode.fixtureProperties.length; fixturePropertyIndex++) {
                for (let effectProperty of effectPropertyValues) {
                  if (mode.fixtureProperties[fixturePropertyIndex].type == effectProperty.fixturePropertyType) {
                    universe.channelValues[fixture.firstChannel + fixturePropertyIndex] = effectProperty.value;
                    previewProperties.push(effectProperty);
                  }
                }
              }
            }

            // Store the calculated values for subsequent fixtures on the same DMX address
            calculatedFixtures.set(fixture.uuid, previewProperties);

            // Apply the preview properties to the 3d fixture
            for (let fixture3d of this.fixtures3d) {
              if (fixture3d.fixture.uuid == fixture.uuid) {
                fixture3d.updatePreview(previewProperties);
              }
            }
          }
        }
      }
    }

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
        function (gltf: any) {
          let model = gltf.scene.children[0];
          model.geometry.center();
          model.position.set(0, 0, 0);

          observer.next(gltf.scene);
          observer.complete();
        },

        // Called while loading is progressing
        function (xhr: any) { },

        // // Called when loading has errors
        function (error: any) {
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
    this.renderer.shadowMap.enabled = false;
    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.set(-600, 80, 700);
  }

  private setupControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 0.05;
    this.controls.zoomSpeed = 1.2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 700;
    this.controls.zoom = 1000;
    this.controls.maxDistance = 2000
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(0, 200, 0);
    this.controls.rotation = 100;
  }

  private setupFloor() {
    let width = 4000;
    let height = 1;

    let geometry = new THREE.BoxGeometry(width, height, width);

    let texture = new THREE.TextureLoader().load('./assets/textures/planks.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
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
    var geometry;
    let mesh;

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
