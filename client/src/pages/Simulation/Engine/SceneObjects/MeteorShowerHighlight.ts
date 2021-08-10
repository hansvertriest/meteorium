// Node imports
import * as THREE from 'three';

// Class imports
import Planet from './Planet';

// Type import
import { 
    IPositionInUnits
} from "../d.types";

export default class MeteorShowerHighlight {
    public name: string;
    public positions: IPositionInUnits[];
    public mesh: THREE.Mesh;
    private parent: Planet;
    private isAttached: boolean;
    private radius: number;
    private color: number;

    constructor ( name: string, positions: IPositionInUnits[], parent: Planet, radius: number, color: number) {
        this.name = name;
        this.positions = positions;
        this.radius = radius;
        this.color = color;
        this.parent = parent;
        this.isAttached = false;

        // // create composed mesh
        // const singleGeometry = new THREE.Geometry();

        // this.positions.forEach((position) => {
        //     const sphere = new THREE.SphereGeometry(this.radius, 10, 10);
        //     const newMesh = new THREE.Mesh( sphere );
        //     newMesh.position.x = position.x;
        //     newMesh.position.y = position.y;
        //     newMesh.position.z = position.z;
        //     newMesh.updateMatrix();
        //     singleGeometry.merge(newMesh.geometry, newMesh.matrix);
        // });

        // const material = new THREE.MeshBasicMaterial({color: this.color, transparent: true, opacity: 0.5});

        this.mesh = new THREE.Mesh();

        // this.attachToParent();
    }

    /**
     * Set positional parameters of MeteorShowerHighlight
     * @param position x, y, z coordinates
     */
    private setPosition = ( position: IPositionInUnits ): void  => {
        this.mesh.position.x = position.x;
        this.mesh.position.y = position.y;
        this.mesh.position.z = position.z;
    }

    /**
     * Adds MeteorShowerHighlight to parent's mesh
     */
    private attachToParent = (): void => {
        this.parent.attach(this.mesh);
        this.isAttached = true;
    }

    /**
     * Removes MeteorShowerHighlight from perant's mesh
     */
    public dettachFromParent = (): void => {
        this.parent.dettach(this.mesh);
        this.isAttached = false;
    }
}