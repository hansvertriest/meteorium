// Node imports
import * as THREE from 'three';

// Class imports
import Context from '../Context';

// Asset import
import earth from '../../assets/textures/8k_earth_daymap.jpg';
import earth_bump from '../../assets/textures/gebco_08_rev_elev_scaled.png';
import oceans from '../../assets/textures/water_4k.png';

export default class Planet {
    public radius: number;
    public mesh: THREE.Mesh;
    public inclinationInDeg: number;
    private rotationAroundAxisInRads: number;
    private initRotationAroundAxisInRads: number;

    constructor( radius: number, inclinationInDeg: number ) {
        // Set object parameters
        this.radius = radius;
        this.inclinationInDeg = inclinationInDeg
        this.rotationAroundAxisInRads = 0;
        this.initRotationAroundAxisInRads = 0;

        // Create Geometry
        const sphere = new THREE.SphereGeometry(this.radius, 100, 100);

        // Create Mesh
        this.mesh = new THREE.Mesh( sphere );

        // Create axist line
        // const materialLine = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        // const points = [];
        // points.push( new THREE.Vector3(0,1,0).multiplyScalar(3) ); 
        // points.push( new THREE.Vector3(0,0,0) ); 
        // const geometry = new THREE.BufferGeometry().setFromPoints( points );
        // const line = new THREE.Line( geometry, materialLine );
        // this.mesh.add(line)

    }

    /**
     * Load in textures and assign material to mesh
     */
    public loadTextures = async (): Promise<void> => {
        // Create Material
        return new Promise((resolve) => {
            let textureHasLoaded = false;
            let elevTextureHasLoaded = false;
            let oceanTextureHasLoaded = false;

            const checkIfLoaded = () => {
                if (textureHasLoaded && elevTextureHasLoaded && oceanTextureHasLoaded) {
                    console.log('Planet Textures loaded');

                    const material = new THREE.MeshPhongMaterial({
                        map: texture,
                        bumpMap: elevTexture,
                        bumpScale:   0.01,
                        specularMap: oceanTexture,
                        specular: new THREE.Color('grey'),
                        shininess: 5
                    });


                    this.mesh.material = material;
                    resolve();
                }
            }

            const texture = new THREE.TextureLoader()
                .load(earth, () => {
                    textureHasLoaded = true;
                    checkIfLoaded();
                })
            const elevTexture = new THREE.TextureLoader()
                .load(earth_bump, () => {
                    elevTextureHasLoaded = true;
                    checkIfLoaded();
                })
            const oceanTexture = new THREE.TextureLoader()
                .load(oceans, () => {
                    oceanTextureHasLoaded = true;
                    checkIfLoaded();
                })
        });
    }

    /**
     * Applies the inclination of the planet
     */
    public setInclination = (): void => {
        // Set inclination
        this.mesh.rotateOnAxis(new THREE.Vector3(0,0,1), this.inclinationInDeg * -1 * Math.PI / 180);
    }

    /**
     * Add planet to the scene of a given context
     * @param context context object
     */
    public addToScene = ( context: Context ): void => {
        context.scene.add(this.mesh);
    }

    /**
     * Update parameters of planet in function of time
     * @param timeInS time in seconds
     */
    public update = ( timeInS: number ): void => {
        const getRotationInPercentage = timeInS / 86400;
        this.setRotation(this.initRotationAroundAxisInRads + Math.PI * 2 * getRotationInPercentage);
    }

    /**
     * Add object3D to planet's mesh
     * @param object object to be added
     */
    public attach = ( object: THREE.Object3D ): void => {
        this.mesh.add(object);
    }

    /**
     * Remove object3D from planet's mesh
     * @param object object to be added
     */
    public dettach = ( object: THREE.Object3D ): void => {
        this.mesh.remove(object);
    }

    public setRotation = ( angleInRadians: number ): void => {
        const yAxis = new THREE.Vector3(0,1,0);

        const axis = yAxis;

        this.mesh.rotateOnAxis(axis, angleInRadians - this.rotationAroundAxisInRads);
        this.rotationAroundAxisInRads = angleInRadians;
    }

    public setInitRotation = ( angleInRadians: number ): void => {
        this.setRotation(angleInRadians);
        this.initRotationAroundAxisInRads = angleInRadians;
    }
}