import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as THREE from 'three';
import "./js/EnableThreeExamples";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/GLTFLoader";
import { Observable } from 'rxjs';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.css']
})
export class PreviewComponent implements AfterViewInit {

  constructor() { }

  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  public controls: THREE.OrbitControls;

  private loader = new THREE.GLTFLoader();

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private animate() {
    if(this.controls) {
      this.controls.update();
    }
    requestAnimationFrame(this.animate.bind(this));
    this.render();
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
    return this.loadScene(name).pipe((scene: THREE.Scene) => {
      let model = scene.children[0];
      model.geometry.center();
      model.position.set(0, 0, 0);

      return model;
    });
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
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(-20, 8, 50);
  }

  private setupControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 0.05;
    this.controls.zoomSpeed = 1.2;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 100;
    this.controls.maxDistance = 200
    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.target = new THREE.Vector3(0, 20, 0);
    this.controls.rotation = 10;
  }

  private setupFloor() {
    let geometry = new THREE.BoxGeometry(20, 0.1, 20, 20, 1, 20);

    var texture = new THREE.TextureLoader().load('./assets/textures/planks.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    var floorMaterial = new THREE.MeshBasicMaterial({ map: texture });

    let floor = new THREE.Mesh(geometry.clone(), floorMaterial);
    floor.receiveShadow = true
    floor.castShadow = true
    floor.scale.multiplyScalar(8.0)
    floor.position.set(0, -geometry.parameters.height / 2, 0)
    this.scene.add(floor);
  }

  private setupStage() {
    // Add a floor
    this.setupFloor();

    // Load the stage
    this.loadScene('stage').subscribe((scene) => {
      // TODO Too heavy for the stage?
      var path = './assets/textures/SwedishRoyalCastle/';
      var format = '.jpg';
      var urls = [
          path + 'px' + format, path + 'nx' + format,
          path + 'py' + format, path + 'ny' + format,
          path + 'pz' + format, path + 'nz' + format
        ];

      var reflectionCube = new THREE.CubeTextureLoader().load( urls );

      let material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.07,
        metalness: 1,
        envMap: reflectionCube,
        envMapIntensity: 1.4

      });

      scene.scale.multiplyScalar(3)

      scene.children.forEach(element => {
        element.material = material;
      });

      this.scene.add(scene);
    });
  }

  private setupScene() {
    // Create a new scene
    this.scene = new THREE.Scene();

    // Add a little bit of ambient light
    let ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    // Create the stage
    this.setupStage();

    // Add the fixtures
    // TODO
  }

  ngAfterViewInit(): void {
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupScene();

    this.onResize();
    this.animate();
  }

}
