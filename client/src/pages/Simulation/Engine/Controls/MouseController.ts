// Node imports
import * as THREE from 'three';

// Type imports
import {
    IMeteorMeshUserData
} from '../../Engine/d.types';


export default class MouseController {
    private rayCaster: THREE.Raycaster;
    private mouse: THREE.Vector2;

    // Event listener collections
    public MeteorHoverListenerCollection: {(meshData: IMeteorMeshUserData): void}[];
    public MeteorHoverOutListenerCollection: {(): void}[];
    public MeteorClickListenerCollection: {(meshData: IMeteorMeshUserData): void}[];

    // Event states
    private meteorIsHovered: boolean;
    private mouseIsUp: boolean;

    constructor( canvasRef: HTMLCanvasElement ) {
        this.rayCaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.MeteorHoverListenerCollection = [];
        this.MeteorHoverOutListenerCollection = [];
        this.MeteorClickListenerCollection = [];

        this.meteorIsHovered = false;
        this.mouseIsUp = false;

        this.registerNativeEventListeners(canvasRef);
    }

    /**
     * Sets eventslistener that update the mouse-vector
     * @param canvasRef canvas reference of the three-simulation
     */
    private registerNativeEventListeners = ( canvasRef:  HTMLCanvasElement ) => {
        // inital mouse-values
        this.mouse.x = window.innerWidth/-2; this.mouse.y = 0;

        // Update mouse-vector on mouse move
        canvasRef.onmousemove = (e: MouseEvent ) => {
            this.mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
        }

        canvasRef.onclick = () => {
            this.mouseIsUp = true;
        }
    }

    public updateRaycaster = ( camera: THREE.Camera, meteorMeshes: THREE.Mesh[] ): void => {
        // Set a raycaster
        this.rayCaster.setFromCamera( this.mouse, camera);

        // Get intersections
        const intersects = this.rayCaster.intersectObjects(meteorMeshes);

        // check for events
        this.checkToFireMeteorClickEvents(intersects);
        this.checkToFireMeteorHoverEvents(intersects);
    }

    /**
     * Check to fire the meteor hover / hover-out events
     * @param intersects intersections from a raycast with selected meshes
     */
    private checkToFireMeteorHoverEvents = ( intersects: THREE.Intersection[] ): void => {
        // Check if there are any interrsections
        if (intersects.length > 0) {
            // fire listeners
            this.MeteorHoverListenerCollection
                .forEach((listener) => listener(intersects[0].object.userData as IMeteorMeshUserData));
            // set meteor hovered state true
            this.meteorIsHovered = true;
        } else if (this.meteorIsHovered) {
            // fire hover-out listeners
            this.MeteorHoverOutListenerCollection.forEach((listener) => listener());
            // set meteor hovered state false
            this.meteorIsHovered = false;
        }
    }

   /**
     * Check to fire the meteor click events
     * @param intersects intersections from a raycast with selected meshes
     */
    private checkToFireMeteorClickEvents = ( intersects: THREE.Intersection[] ): void => {
        if (this.mouseIsUp) {
            // Check if there are any interrsections
            if (intersects.length > 0) {
                // fire listeners
                this.MeteorClickListenerCollection
                    .forEach((listener) => listener(intersects[0].object.userData as IMeteorMeshUserData));
            }

            this.mouseIsUp = false;
        }
    }

}