import { Fixture } from './fixture';
import * as THREE from 'three';

export class MovingHead implements Fixture {
    private headGroup: THREE.Object3D = new THREE.Object3D();
    private armGroup: THREE.Object3D = new THREE.Object3D();
    private objectGroup: THREE.Object3D = new THREE.Object3D();
    private spotLight: THREE.SpotLight;
    private spotLightHelper: THREE.SpotLightHelper;
    private shadowCameraHelper: THREE.CameraHelper;
    private spotLightBeam: THREE.Mesh;
    private camera: THREE.Camera;
    private scene: THREE.scene;

    private moonGlow;

    color: THREE.Color = new THREE.Color('red');
    pan: number = 0;
    tilt: number = 0;
    name: string = "";

    positionX: number = 0;
    positionY: number = 0;
    positionZ: number = 0;

    // TODO add color, gobo, etc.

    private atmosphereMat() {
        var vertexShader = [
            'varying vec3	vVertexWorldPosition;',
            'varying vec3	vVertexNormal;',

            'varying vec4	vFragColor;',

            'void main(){',
            '	vVertexNormal	= normalize(normalMatrix * normal);',

            '	vVertexWorldPosition	= (modelMatrix * vec4(position, 1.0)).xyz;',

            '	// set gl_Position',
            '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}',

        ].join('\n')
        var fragmentShader = [
            'uniform vec3	glowColor;',
            'uniform float	coeficient;',
            'uniform float	power;',

            'varying vec3	vVertexNormal;',
            'varying vec3	vVertexWorldPosition;',

            'varying vec4	vFragColor;',

            'void main(){',
            '	vec3 worldCameraToVertex= vVertexWorldPosition - cameraPosition;',
            '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
            '	viewCameraToVertex	= normalize(viewCameraToVertex);',
            '	float intensity		= pow(coeficient + dot(vVertexNormal, viewCameraToVertex), power);',
            '	gl_FragColor		= vec4(glowColor, intensity);',
            '}',
        ].join('\n')

        // create custom material from the shader code above
        //   that is within specially labeled script tags
        var material = new THREE.ShaderMaterial({
            uniforms: {
                coeficient: {
                    type: "f",
                    value: 0.3
                },
                power: {
                    type: "f",
                    value: 1.3
                },
                glowColor: {
                    type: "c",
                    value: new THREE.Color('white')
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            //blending	: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: true,
        });

        return material;
    }

    constructor(scene: THREE.scene, camera: THREE.camera, socket: THREE.Mesh, arm: THREE.Mesh, head: THREE.Mesh) {
        this.camera = camera;
        this.scene = scene;

        // TODO
        let path = './assets/textures/SwedishRoyalCastle/';
        let format = '.jpg';
        let urls = [
            path + 'px' + format, path + 'nx' + format,
            path + 'py' + format, path + 'ny' + format,
            path + 'pz' + format, path + 'nz' + format
        ];

        var reflectionCube = new THREE.CubeTextureLoader().load(urls);

        let material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.07,
            metalness: 1,
            envMap: reflectionCube,
            envMapIntensity: 1.4
        });

        socket.material = material;
        arm.material = material;
        head.material = material;

        // Add the head
        head.scale.multiplyScalar(0.9)
        let headPivotGroup = new THREE.Object3D();
        headPivotGroup.add(head);
        this.headGroup.add(headPivotGroup);

        // Add the spotlight
        let spotlightGroup = new THREE.Object3D();

        this.spotLight = new THREE.SpotLight(0xffffff, 1);
        this.spotLight.angle = 0.13; //Math.PI / 4;
        this.spotLight.penumbra = 0.5;
        this.spotLight.decay = 2;
        this.spotLight.distance = 200;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = 1024;
        this.spotLight.shadow.mapSize.height = 1024;
        this.spotLight.shadow.camera.near = 10;
        this.spotLight.shadow.camera.far = 200;
        this.spotLight.intensity = 3;

        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        //scene.add(this.spotLightHelper);

        this.shadowCameraHelper = new THREE.CameraHelper(this.spotLight.shadow.camera);
        //scene.add(this.shadowCameraHelper);

        let spotLightTarget = new THREE.Object3D();
        this.spotLight.target = spotLightTarget;

        spotlightGroup.add(this.spotLight);
        spotlightGroup.add(spotLightTarget);
        this.spotLight.position.set(0, -1.4, 0);
        spotLightTarget.position.set(0, -10, 0);

        // Add the light beam
        let geometry = new THREE.CylinderGeometry(0.1, 10, 100, 64, 20, false);

        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, -geometry.parameters.height / 2, 0));
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

        var zrak_mat = new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, opacity: 0.1 });

        this.spotLightBeam = new THREE.Mesh(geometry, this.atmosphereMat());
        this.spotLightBeam.position.set(0, -0.02, 0);

        spotlightGroup.add(this.spotLightBeam);
        this.spotLightBeam.rotation.x = Math.PI / 2;

        this.headGroup.add(spotlightGroup);

        // Add the arm
        this.armGroup.add(this.headGroup);
        this.headGroup.position.set(0, -0.6, 0);
        this.armGroup.add(arm);
        arm.rotation.x = - Math.PI / 2;

        // Add the socket
        this.objectGroup.add(this.armGroup);
        this.objectGroup.add(socket);
        socket.position.set(0, 1.2, 0);

        scene.add(this.objectGroup);
    }

    public getObject(): THREE.Object3D {
        return this.objectGroup;
    }

    public update() {
        this.objectGroup.position.set(this.positionX, this.positionY, this.positionZ);
        this.armGroup.rotation.y = this.pan;
        this.headGroup.rotation.x = this.tilt + 0;

        this.spotLightHelper.update();
        this.shadowCameraHelper.update();

        this.spotLight.color = this.color;
        this.spotLightBeam.material.uniforms.glowColor.value = this.color;

        // this.spotLightBeam.material.uniforms.viewVector.value =
        //     new THREE.Vector3().subVectors(this.camera.position, this.spotLightBeam.position);
    }
}
