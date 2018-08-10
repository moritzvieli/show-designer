import { Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';

import * as THREE from 'three';
// import "./js/EnableThreeExamples";
// import "three/examples/js/controls/OrbitControls";
// import "three/examples/js/loaders/ColladaLoader";


import Split from 'split.js';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'app';

  private renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  @ViewChild('canvas')
  private canvasRef: ElementRef;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private getAspectRatio(): number {
    let height = this.canvas.clientHeight;

    if (height === 0) {
      return 0;
    }

    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  ngAfterViewInit(): void {
    Split(['#row1', '#row2', '#row3'], {
      sizes: [50, 30, 20],
      direction: 'vertical',
      cursor: 'row-resize',
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    Split(['#scenes', '#preview'], {
      sizes: [30, 70],
      snapOffset: 0,
      gutterSize: 15,
      onDrag: this.onResize.bind(this)
    });

    this.renderer = new THREE.WebGLRenderer({
      //canvas: this.canvas,
      antialias: true
    });
    this.canvas.appendChild(this.renderer.domElement);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();

    let ambient = new THREE.AmbientLight(0xffffff, 0.1);
    this.scene.add(ambient);

    this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.set(0, 8, 50);

    // Add a ground
    var geometry = new THREE.BoxGeometry(20, 0.1, 20, 20, 1, 20);
    var xxy = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.5,
      clearCoat: 1.0,
      clearCoatRoughness: 1.0,
      reflectivity: 1.0
    });
    var xx = new THREE.Mesh(geometry.clone(), xxy);
    xx.receiveShadow = true
    xx.castShadow = true
    xx.scale.multiplyScalar(5.01)
    xx.position.set(0, -geometry.parameters.height / 2, 0)
    this.scene.add(xx);

    // let controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    // controls.addEventListener('change', this.render);
    // controls.minDistance = 20;
    // controls.maxDistance = 500;
    // controls.enablePan = false;

    this.onResize();
  }

  @HostListener('window:resize', ['$event'])
  public onResize() {
    // this.canvas.style.width = "100%";
    // this.canvas.style.height = "100%";

    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  }

}
