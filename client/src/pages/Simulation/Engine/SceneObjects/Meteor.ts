// Node imports
import * as THREE from 'three';

// Class imports
import Context from '../Context';
import Planet from './Planet';

// Type imports
import { IMeteorData, IPositionInUnits, NetworkColor, IMeteorMeshUserData } from '../d.types';

export default class Meteor {
    public id: string;
    public radius: number;
    public properties: IMeteorData;
    public mesh: THREE.Mesh;
    private parent: Planet;
    private static: boolean;
    public isAttached: boolean;
    private networkColor: number;
    public color: number;
    public isHighlightedPerNetwork: boolean;

    private trailGeometry: THREE.BufferGeometry;
    private trail: THREE.Line;
    // private trailMesh: THREE.Mesh;
    private trailMaterial: THREE.Material;
    private trailPoints: THREE.Vector3[];
    
    private beginPosition: IPositionInUnits;
    private endPosition: IPositionInUnits;

    constructor( id: string, parent: Planet, radius: number, position: IPositionInUnits, endPosition: IPositionInUnits, data: IMeteorData, hasMovement = false ) {
        // Set object parameters
        this.id = id;
        this.parent = parent;
        this.radius = radius;
        this.properties = data;
        this.static = hasMovement;
        this.isAttached = false;
        this.networkColor = Number(NetworkColor[data.network]);
        this.color = 0xffedc7;
        this.isHighlightedPerNetwork = false;
        this.beginPosition = position;
        this.endPosition = endPosition;
        
        // create mesh
        const sphere = new THREE.SphereGeometry(this.radius, 10, 10);
        const material = new THREE.MeshBasicMaterial({color: this.color});
        this.mesh = new THREE.Mesh( sphere, material );

        // set mesh data
        const meshUserData: IMeteorMeshUserData = {
            showerIauCode: this.properties.iauCode,
        }
        this.mesh.userData = meshUserData;

        // Create cone mesh
        this.trailMaterial = new THREE.LineBasicMaterial({color: this.color, transparent: true});
        this.trailPoints = [
            new THREE.Vector3(position.x, position.y, position.z),
            // new THREE.Vector3(position.x, position.y, position.z),
            new THREE.Vector3(endPosition.x, endPosition.y, endPosition.z)
        ]
        this.trailGeometry = new THREE.BufferGeometry().setFromPoints(this.trailPoints);
        this.trail = new THREE.Line( this.trailGeometry, this.trailMaterial );

        // set position
        this.setPosition(position);

        // If static immediately add to parent
        if (this.static) this.attachToParent();
    }

    /**
     * Set positional parameters of Meteor
     * @param position x, y, z coordinates
     */
    private setPosition = ( position: IPositionInUnits ): void  => {
        this.mesh.position.set(position.x, position.y, position.z);
    }

    /**
     * Sets a color for the meteor-material
     * @param color color of highlight
     */
    public highlight = ( color: number ): void => {
        const material = this.mesh.material as any;
        material.color.setHex(color);
    }

    /**
     * Sets the highlighted-state of the meteor to true and changes color of material
     */
    public highlightPerNetwork = (): void => {
        this.highlight(this.networkColor);
        this.isHighlightedPerNetwork = true;
    }

    /**
     * Sets the highlighted-state of the meteor to false and resets color of material
     */
    public removeHighlight = (): void => {
        const material = this.mesh.material as any;
        material.color.setHex(this.color);
        this.isHighlightedPerNetwork = false;
    }

    /**
     * Update position in function of time
     * @param context context of simulation
     * @param timeInS time in seconds
     * @param speed speed of simulation
     */
    private updatePosition = ( context: Context, timeInS: number, speed: number ): void => {
        // Calculate how long meteor has been visible in ratio to it's total lifespan
        const lifeProgressionInPercentage = (timeInS - this.properties.timeFromZeroPointInS - this.properties.tBegin) / ((this.properties.tEnd - this.properties.tBegin)*speed);

        // Calculate current position
        const beginPosVector = new THREE.Vector3(this.beginPosition.x, this.beginPosition.y, this.beginPosition.z);
        const endPosVector = new THREE.Vector3(this.endPosition.x, this.endPosition.y, this.endPosition.z);
        const currentPosition = new THREE.Vector3().lerpVectors(beginPosVector, endPosVector, lifeProgressionInPercentage);

        // If meteor should still be visible => calculate and update position
        if(lifeProgressionInPercentage < 1) {
            this.setPosition({
                x: currentPosition.x,
                y: currentPosition.y,
                z: currentPosition.z,
            })
        }

        // update sphere size
        if (lifeProgressionInPercentage > 0.8 && lifeProgressionInPercentage < 1) {
            const animationProgressInPercentage = (lifeProgressionInPercentage-1)*-1 / 0.2;
            if (animationProgressInPercentage < 0) console.log('s')
            this.mesh.scale.x = animationProgressInPercentage;
            this.mesh.scale.y = animationProgressInPercentage;
            this.mesh.scale.z = animationProgressInPercentage;
        }

        // Update trail
        this.trailPoints = [
            beginPosVector,
            currentPosition
        ]

        this.trail.geometry.attributes.position.needsUpdate = true;
        this.trail.geometry = new THREE.BufferGeometry().setFromPoints(this.trailPoints);
    }

    /**
     * Attaches/dettaches meteor from parent and cals update-method
     * @param context context of simulation
     * @param timeInS time in seconds
     * @param speed speed of simulation
     */
    public update = (context: Context, timeInS: number, speed: number): void => {
        // add to scene if necessary
        if (!this.isAttached && this.properties.timeFromZeroPointInS + this.properties.tBegin <= timeInS) {
            this.attachToParent();
        }
        // remove from scene if not visible yet
        if (this.isAttached && this.properties.timeFromZeroPointInS + this.properties.tBegin >= timeInS) {
            this.dettachFromParent();
            this.dettachTrailFromParent()
        }
        // remove from scene if not visible anymore
        if (this.isAttached && this.properties.timeFromZeroPointInS + this.properties.tEnd*speed <= timeInS) {
            this.dettachFromParent();
            this.dettachTrailFromParent()
        }

        // Fade out trail of meteor recently detached
        if (this.properties.timeFromZeroPointInS + this.properties.tEnd*speed <= timeInS) {
            const secondsOverTime = timeInS - this.properties.timeFromZeroPointInS + this.properties.tEnd;
            const trailLifeTimeInS = 6000;
            this.trailMaterial.opacity = 1 - secondsOverTime/trailLifeTimeInS;
            if (this.trailMaterial.opacity < 0) this.dettachTrailFromParent()
        }

        // Update position
        if (!this.static && this.isAttached) this.updatePosition(context, timeInS, speed);
    }

    /**
     * Adds meteor to parent's mesh
     */
    public attachToParent = (): void => {
        // Attach meteor- and trailmesh to parent
        this.parent.attach(this.mesh);
        this.parent.attach(this.trail);
        // Reset meteor
        this.mesh.scale.x = 1;
        this.mesh.scale.y = 1;
        this.mesh.scale.z = 1;
        // Make sure trailMaterial is visible
        this.trailMaterial.opacity = 1;

        this.isAttached = true;
    }

    /**
     * Removes meteor from perant's mesh
     */
    public dettachFromParent = (): void => {
        this.parent.dettach(this.mesh);
        this.isAttached = false;
    }

    /**
     * Removes trail from perant's mesh
     */
    public dettachTrailFromParent = (): void => {
        this.parent.dettach(this.trail);
    } 
}