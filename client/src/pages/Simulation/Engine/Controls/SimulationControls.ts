// Class imports 
import Simulation from '../Simulation';

// Type imports
import {
    IOnSimLoadStartEvent
} from '../d.types';

export default class MeteorControls {
    private simulation: Simulation;

    constructor( simulation: Simulation ) {
        this.simulation = simulation;
    }


    // ADD EVENT LISTENERS
    /**
     * Adds an eventListener for a certain eventType
     * @param callback callback-function to be executed oon event-trigger
     */
    public addOnSimLoadedEventListener = ( callback: { (): void } ): void => {
        this.simulation.onSimLoadedListeners.push(callback);
    }
    public addOnSimStartLoadEventListeners = ( callback: { (e: IOnSimLoadStartEvent ): void } ): void => {
        this.simulation.onSimStartLoadListeners.push(callback);
    }
    
    public disableSun = (): void => {
        this.simulation.sun.removeFromScene(this.simulation.context);
    }

    public enableSun = (): void => {
        this.simulation.sun.addToScene(this.simulation.context);
    }

    /**
     * Get total amount of meteors in selected day
     */
    public getAmountOfMeteors = (): number => {
        return this.simulation.meteors.length
    }

    public getUrl = (): string =>  {
        const date = this.simulation.data.getSelectedDateString();
        const { lon, lat } = this.simulation.context.getCameraGetodeticCoords(); 
        const time = this.simulation.clock.getSimTimeinS();
        return `https://www.meteorium.space?lon=${lon}&lat=${lat}&date=${date}&time=${time}`
    }
}