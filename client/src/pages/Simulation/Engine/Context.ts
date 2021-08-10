// Node imports
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DeviceOrientationControls } from 'three/examples/jsm/controls/DeviceOrientationControls'

// Class imports
import MouseController from './Controls/MouseController';

// Type imports
import { IPositionGeodetic, IPositionInUnits } from './d.types';

export default class Context {
    // THREE properties
    private renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;
    public cameraMesh: THREE.Mesh;
    private ambientLight: THREE.AmbientLight;
    public scene: THREE.Scene;

    public controls: OrbitControls | DeviceOrientationControls;
    public orbitControls: OrbitControls;
    public deviceOrientationControls: DeviceOrientationControls;
    public mouseController: MouseController;

    // Simulation parameters
    public unitInM: number;
    public unit: number;
    public distanceEarthToSun: number;

    constructor( canvas: HTMLCanvasElement ) {
        // Initialise THREE project
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.cameraMesh = new THREE.Mesh();
        this.cameraMesh.add(this.camera);
        this.scene = new THREE.Scene;
        this.ambientLight = new THREE.AmbientLight(0x333333, 0.8)
        this.scene.add(this.ambientLight);

        // Create deviceOrientationControls
        this.deviceOrientationControls = new DeviceOrientationControls( this.camera );

        // Create oribtControls
        this.orbitControls = new OrbitControls( this.camera, canvas );
        this.orbitControls.rotateSpeed = 0.5;
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.3;
        this.orbitControls.enableZoom = true;
        this.orbitControls.enablePan = false;
        this.orbitControls.minDistance = 1.15;

        // Set default controls
        this.controls = this.orbitControls;

        // Set simulation parameters
        this.unit = 1;
        this.unitInM = 6378137      // radius of earth
        this.distanceEarthToSun = this.unitInM * 5;

        // Set initial simulation parameters
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // this.camera.position.z = 5;
        
        // Set responsive canvas
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        })

        // Create MouseController
        this.mouseController = new MouseController( canvas );

        // const axesHelper = new THREE.AxesHelper( 5 );
        // this.scene.add( axesHelper );
        // this.cameraMesh.add( axesHelper );
    }

    /**
     * Render the scene
     */
    public render = (): void => {
        this.renderer.render( this.scene, this.camera );
    }
    /**
     * Convert meters to units
     * @param meters distance in meters to be converted
     */
    public meterToUnits = ( meters: number ): number => {
        return meters / this.unitInM;
    }
    
    /**
     * Convert units to meters
     * @param units distance in units to be converted
     */
    public unitsToMeters = ( units: number ): number => {
        return units * this.unitInM;
    }

    /**
     * Convert lon, lat, h to x, y, z
     * @param positionGeodetic postion in lon, lat, h
     */
    public geodeticPosToUnitPos = ( positionGeodetic: IPositionGeodetic ): IPositionInUnits => {
        const radiusInM = this.unitInM + positionGeodetic.h;
        const radiusInUnits = this.meterToUnits(radiusInM);

        const cosLat = Math.cos(positionGeodetic.lat * Math.PI / 180.0);
        const sinLat = Math.sin(positionGeodetic.lat * Math.PI / 180.0);
        const cosLon = Math.cos(positionGeodetic.lon * Math.PI / 180.0);
        const sinLon = Math.sin(positionGeodetic.lon * Math.PI / 180.0);
        // const rad = 6378137.0;
        const f = 1.0 / 298.257224;
        const C = 1.0 / Math.sqrt(cosLat * cosLat + (1 - f) * (1 - f) * sinLat * sinLat);
        const S = (1.0 - f) * (1.0 - f) * C;
        const h = 0.0;

        const positionInUnits = {
            x: (radiusInUnits * C + h) * cosLat * cosLon,
            z: (radiusInUnits * C + h) * cosLat * sinLon *-1, // *-1 because of THREE-coordinate-system
            y: (radiusInUnits * S + h) * sinLat,
        }

        return positionInUnits;
    }

    /**
     * Controls methods
     */

    /**
     * Enable fps view
     * @param earthInitRotation initial rotation of the earth in radians
     */
    public enableFPSView = ( lon: number, lat: number ): void => {
        // Update camera properties
        this.camera.near = 0.00001;
        this.camera.fov = 100;
        this.camera.updateProjectionMatrix();

        // Update lighting
        this.ambientLight.intensity = 1;

        // Get position
        const h = this.unitsToMeters(0.002);
        const positionInUnits: IPositionInUnits = this.geodeticPosToUnitPos({lon, lat, h});

        // Position mesh
        this.cameraMesh.position.x = positionInUnits.x;
        this.cameraMesh.position.y = positionInUnits.y;
        this.cameraMesh.position.z = positionInUnits.z;
        this.camera.position.set(0,0,0);

        // rotate cameraMesh
        this.cameraMesh.lookAt(0, 0 ,0)
        this.cameraMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), (-90)*Math.PI/180);

        // Enable deviceOrientationControls
        this.controls.enabled = false;
        this.controls = this.deviceOrientationControls;
        this.controls.enabled = true;
    }

    /**
     * Disable fps view
     */
        public disableFPSView = (): void => {
        // Update camera properties
        this.camera.near = 0.1;
        this.camera.fov = 50;
        this.camera.updateProjectionMatrix();

        // Update lighting
        this.ambientLight.intensity = 0.8;

        // Enable orbitControls
        this.controls.enabled = false;
        this.controls = this.orbitControls;
        this.controls.enabled = true;
        
    }


    /**
     * Camera methods 
     */

    /**
     * Move the camera to a geodetic position
     * @param lon lon of camera position
     * @param lat lat of camera position
     * @param hInUnits height in units (default 0.5)
     */
    public moveCameraToGeodeticCoords = ( lon: number, lat: number, hInUnits = 0.5): void => {
        const h = this.unitsToMeters(hInUnits);
        const positionInUnits: IPositionInUnits = this.geodeticPosToUnitPos({lon, lat, h});

        this.camera.position.x = positionInUnits.x;
        this.camera.position.y = positionInUnits.y;
        this.camera.position.z = positionInUnits.z;
        this.orbitControls.update();
    }

    public getCameraGetodeticCoords = (): {lon: number, lat: number, hInUnits: number} => {
        const x = this.camera.position.x;
        const y = this.camera.position.y;
        const z = this.camera.position.z;

        const sphericalVector = new THREE.Spherical();
        sphericalVector.setFromVector3(this.camera.position);

        const piToDegrFactor = 180/Math.PI;

        const r = Math.sqrt(x**2 + y**2 + z**2);
        const lon = Math.atan2(z,x)*piToDegrFactor*-1;
        const lat = 90 - (Math.acos(y / r)) * 180 / Math.PI;

        return { lon, lat, hInUnits: r-this.unit }
    }
}