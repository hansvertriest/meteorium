// Node imports
import * as THREE from 'three';
import {createTimeOfInterest} from 'astronomy-bundle/time';
import {createSun} from 'astronomy-bundle/sun';

// Class imports
import Context from '../Context';

// Types imports
import { IPositionInUnits } from '../d.types';

// Asset imports
import sun from '../../assets/textures/2k_sun.jpg';

export default class Sun {
    private light: THREE.DirectionalLight;
    public angleSunToEarthInRads: number;
    public distanceFromEarthInUnits: number;
    public position: IPositionInUnits;
    private mesh: THREE.Mesh;

    constructor() {
        // Less accurate assignment
        this.angleSunToEarthInRads = 0;
        this.position = {x: 0, y: 0, z: 0};
        this.distanceFromEarthInUnits = 25;

        // Set object parameters
        this.light = new THREE.DirectionalLight(0xffffff, 1.5);

        // create mesh
        const sphere = new THREE.SphereGeometry(1, 10, 10);
        const material = new THREE.MeshPhongMaterial({color: 0xff0000});
        this.mesh = new THREE.Mesh( sphere, material );

    }

    /**
     * Load in textures and assign material to mesh
     */
    public loadTextures = async (): Promise<void> => {
        // Create Material
        return new Promise((resolve) => {
            let textureHasLoaded = false;

            const checkIfLoaded = () => {
                if (textureHasLoaded) {
                    console.log('Planet Textures loaded');

                    const material = new THREE.MeshPhongMaterial({
                        emissive: 0x996633,
                        emissiveIntensity: 1,
                        map: texture,   
                    });

                    this.mesh.material = material;
                    resolve();
                }
            }

            const texture = new THREE.TextureLoader()
                .load(sun, () => {
                    textureHasLoaded = true;
                    checkIfLoaded();
                })

        });
    }

    /**
     * Translates sun (mesh+light) along the x-axis using a translationVector
     * @param translation 
     * @param distance 
     */
    public setPositionAlongXAxis = (translation: THREE.Vector3, distance = this.distanceFromEarthInUnits): void => {
        this.light.translateOnAxis(
            translation,
            distance
        );
        this.mesh.translateOnAxis(
            translation,
            distance
        );
        this.position = this.mesh.position;
    }

    public resetSunPositionToOrigin = (): void => {
        this.mesh.position.set(0,0,0);
        this.light.position.set(0,0,0);
        this.position = this.mesh.position;
    }

    /**
     * Calculate and set position of the sun
     * @param date date string [YYYY-MM-DD]
     */
    public calcAndSetPosition = async ( date: string ): Promise<void> => {
        // get sun position 
        const dateArray = date.split('-');
        const toi = createTimeOfInterest.fromTime(+dateArray[0], +dateArray[1], +dateArray[2], 0, 0, 0);
        const sun = createSun(toi);

        await sun.getApparentGeocentricEclipticRectangularCoordinates()
            .then((response) => {
                // NewPosition with conversion between coordinate-systems
                const newPosition = {x: response.y, y: response.z, z: response.x};
                this.angleSunToEarthInRads = Math.atan2(newPosition.z, newPosition.x*-1);
                // First set position to 0, 0, 0
                this.resetSunPositionToOrigin();
                // Do translation
                this.setPositionAlongXAxis(
                    new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z)
                );
            });
    }

    /**
     * Rotate the sun around the z-axis of a given origin 
     * @param origin 
     * @param angleInDegrees 
     */
    public rotateZAxisEquator = (origin: IPositionInUnits, angleInDegrees: number): void => {
        // calculate move direction and move distance:
        const moveDir = new THREE.Vector3(
            origin.x - this.position.x,
            origin.y - this.position.y,
            origin.z - this.position.z
        );
        moveDir.normalize();
        // move sun to anchor point
        this.light.translateOnAxis(moveDir, this.distanceFromEarthInUnits);
        this.mesh.translateOnAxis(moveDir, this.distanceFromEarthInUnits);
        // rotate sun
        this.light.rotateZ(angleInDegrees * Math.PI / 180);
        this.mesh.rotateZ(angleInDegrees * Math.PI / 180);
        // move sun along the opposite direction
        moveDir.multiplyScalar(-1);
        this.mesh.translateOnAxis(moveDir, this.distanceFromEarthInUnits);
        this.light.translateOnAxis(moveDir, this.distanceFromEarthInUnits);
    }
    
    /**
     * Adds sun to a scene of the given context
     * @param context Conteext-object of which the sun should be added to
     */
    public addToScene = ( context: Context ): void => {
        context.scene.add(this.light);
        context.scene.add(this.mesh);
    }

    public removeFromScene = ( context: Context ): void => {
        context.scene.remove(this.light);
        context.scene.remove(this.mesh);
    }
}