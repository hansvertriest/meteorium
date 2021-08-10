// Node imports

// Class imports
import Context from './Context';
import SimData from './SimData';
import Clock from './Clock';
import Planet from './SceneObjects/Planet';
import Meteor from './SceneObjects/Meteor';
import Sun from './SceneObjects/Sun';
import MeteorShowerHighlight from './SceneObjects/MeteorShowerHighlight'

// Type imports 
import { 
    IPositionInUnits, 
    IOnSimLoadStartEvent,
} from './d.types';

export default class Simulation {
    public context: Context; 
    public data: SimData;
    public meteors: Meteor[];
    public meteorShowerHiglights: MeteorShowerHighlight[];
    public clock: Clock;

    // Objects
    public sun: Sun;
    private earth: Planet;

    // Animation
    private currentAnimation: number | undefined;

    // Listener collections
    public onSimLoadedListeners: { (): void }[];
    public onSimStartLoadListeners: { (e: IOnSimLoadStartEvent): void }[];

    constructor( canvas: HTMLCanvasElement ) {
        this.context = new Context(canvas);
        this.data = new SimData();
        this.meteors = [];
        this.meteorShowerHiglights = [];
        this.clock = new Clock();
        this.currentAnimation = undefined;
        this.onSimLoadedListeners = [];
        this.onSimStartLoadListeners = [];

        // Create objects
        this.earth = new Planet(this.context.unit, 23.4);
        this.sun = new Sun();

        // Attach camera to the earth
        this.earth.attach(this.context.cameraMesh);
        this.context.controls.update();

        // Set inclination
        this.sun.rotateZAxisEquator({x: 0, y: 0, z: 0}, this.earth.inclinationInDeg); // earth is not tilted
        // this.earth.setInclination(); // earth is tilted
    }

    public init = ( date: Date, timeInS: number, lon: number, lat: number ): Promise<void> => {
        return Promise.all([
            this.earth.loadTextures(),
            this.sun.loadTextures()
        ]).then(() => {
            this.earth.addToScene(this.context);
            this.sun.addToScene(this.context);
        }).then(async () => await this.initSim( date, timeInS, { lon, lat }, undefined, false ));
    }

    /**
     * Intialise the simulation
     */
    public initSim = async ( date = new Date("2016-9-22"), timeInS = 1000 , position = {lon: -118.243683, lat: 34.052235 }, height = 0.5, fpMode = false, useExistingData = false ): Promise<void> => {
        // Fire onSimLoadStartListeners
        this.onSimStartLoadListeners.forEach((listener) => listener({date: date, timeInHM: this.clock.convertTimeInHM(timeInS), position: position}))

        // Delete meteors
        this.deleteMeteors();

        // Download data
        if ( !useExistingData ) await this.data.selectDate(date);

        // Position sun 
        await this.sun.calcAndSetPosition(this.data.getSelectedDateString());

        // Rotate earth to sun
        this.earth.setInitRotation(0);
        this.earth.setInitRotation(this.sun.angleSunToEarthInRads);

        // Load in meteors
        await this.loadMeteors((fpMode) ? 0.0001 : undefined);

        // start clock
        if (this.currentAnimation) cancelAnimationFrame(this.currentAnimation);
        this.animate();
        this.clock.start();
        this.clock.pause();

        // Set initial values
        this.clock.setSimTimeInS(timeInS);
        this.context.moveCameraToGeodeticCoords(position.lon, position.lat, height);

        if (fpMode) {
            console.log('fpMode enabled')
            this.context.enableFPSView( position.lon, position.lat );
        } else {
            console.log('fpMode enabled')
            this.context.disableFPSView();
        }
        
        // Fire onSimLoadedListeners
        this.onSimLoadedListeners.forEach((listener) => listener())
    }

    /**
     * Fetch, create Meteors and add them to this.meteors
     */
    private loadMeteors = async ( radius = this.context.unit / 500 ): Promise<void> => {
        const meteorsToBePushed: Meteor[] = [];
        const staticMeteorsToBePushed: Meteor[] = [];
        // const highlightsToBePushed: MeteorShowerHighlight[] = [];

        // Load meteors
        await new Promise<void>( (resolve) => {
            if (this.data.meteors.length <= 0) resolve();

            // Create meteors and put them in this.meteors
            this.data.meteors.forEach(( meteorData, index ) => {
                const position: IPositionInUnits = this.context.geodeticPosToUnitPos({
                    lon: meteorData.lonBegin,
                    lat: meteorData.latBegin,
                    h: meteorData.hBegin
                });
                const endPosition: IPositionInUnits = this.context.geodeticPosToUnitPos({
                    lon: meteorData.lonEnd,
                    lat: meteorData.latEnd,
                    h: meteorData.hEnd
                });
                const meteor = new Meteor( 'meteor-'+index, this.earth, radius, position, endPosition, meteorData );
                meteorsToBePushed.push(meteor);

                // Resolve promise
                if(meteorsToBePushed.length === this.data.meteors.length) {
                    console.log('Done loading meteors')
                    this.meteors.push(...meteorsToBePushed)
                    resolve();
                }
            });
        });

        // load static meteors
        await new Promise<void>( (resolve) => {
            if (this.data.staticMeteors.length <= 0) resolve();

            // Create meteors and put them in this.meteors
            this.data.staticMeteors.forEach(( meteorData, index ) => {
                const radius = this.context.unit / 700;
                const position: IPositionInUnits = this.context.geodeticPosToUnitPos({
                    lon: meteorData.lonBegin,
                    lat: meteorData.latBegin,
                    h: meteorData.hBegin
                });
                const endPosition: IPositionInUnits = this.context.geodeticPosToUnitPos({
                    lon: meteorData.lonEnd,
                    lat: meteorData.latEnd,
                    h: meteorData.hEnd
                });
                const meteor = new Meteor( 'meteor-'+index, this.earth, radius, position, endPosition, meteorData, true );
                staticMeteorsToBePushed.push(meteor);

                // Resolve promise
                if(staticMeteorsToBePushed.length === this.data.staticMeteors.length) {
                    console.log('Done loading static meteors')
                    this.meteors.push(...staticMeteorsToBePushed)
                    resolve();
                }
            });
        });

        // load MeteorShowerHighlights
        // await new Promise<void>((resolve) => {
        //     const showerNames = Object.keys(this.data.showers);
        //     showerNames.forEach((showerName, index) => {
        //         const showerPositionsGeodetic: IPositionGeodetic[] = this.data.showers[showerName];
        //         const showerPositionsInUnits: IPositionInUnits[] = showerPositionsGeodetic.map((position) => this.context.geodeticPosToUnitPos(position));

        //         const colors = [0xff00ff, 0x4287f5, 0x42f5e9, 0xadf542, 0xadf542, 0xf54242]

        //         const highlight = new MeteorShowerHighlight(
        //             showerName,
        //             showerPositionsInUnits,
        //             this.earth,
        //             this.context.unit / 500,
        //             colors[index % colors.length]
        //         );

        //         highlightsToBePushed.push(highlight);

        //         // Resolve promise
        //         if(highlightsToBePushed.length === showerNames.length) {
        //             console.log('Done loading highlights')
        //             this.meteorShowerHiglights.push(...highlightsToBePushed)
        //             resolve();
        //         }
        //     });
        // })  
    }
    

    /**
     * Update every meteor in this.meteors
     */
    private updateMeteors = (): void => {
        this.meteors.forEach((meteor) => meteor.update(this.context, this.clock.getSimTimeinS(), this.clock.speed));
    }

    /**
     * Makes sure all meteors are shown
     */
    private showStaticMeteors = (): void => {
        this.meteors.forEach((meteor) => {
            if (!meteor.isAttached) meteor.attachToParent();
        })
    }

    /**
     * Delete all meteors from it's parent
     */
    private deleteMeteors = (): void => {
        this.meteors.forEach((meteor) => meteor.dettachFromParent());
        this.meteors = [];
    }

    /**
     * Main animation loop
     */
    private animate = () : void =>  {
        // Request next frame
        this.currentAnimation = requestAnimationFrame(this.animate);

        // update clock
        if(this.clock.getSimTimeinS() < 86400) {
            this.clock.updateSimTime();
        } else if (this.clock.isRunning) {
            this.clock.pause();
            this.clock.setSimTimeInS(0);
        }
        
        // Update meteors
        if (this.clock.staticEnabled) {
            this.showStaticMeteors();
        } else {
            this.updateMeteors();
        }

        // update scene objects
        this.earth.update(this.clock.getSimTimeinS());
        this.context.controls.update();

        // Controller checks
        this.context.mouseController.updateRaycaster(
            this.context.camera, 
            this.meteors.filter((meteor) => meteor.isAttached).map((meteor) => meteor.mesh)
        );
    
        // Render scene
        this.context.render();
    }


}