// Interface imports
import { 
    IOnTimeChangeEvent
} from './d.types'

export default class Clock {
    private lastUpdate: number;
    private simTime: number;
    public staticEnabled: boolean;
    public isRunning: boolean;
    public isPausedByUser: boolean;
    public speed: number;

    // Listener collections
    public onChangeListeners: { (e: IOnTimeChangeEvent): void }[];
    public onStartListeners: { (): void }[];
    public onPauseListeners: { (): void }[];

    constructor () {
        this.lastUpdate = performance.now();
        this.isRunning = false;
        this.isPausedByUser = false;
        this.simTime = 0;
        this.speed = 8000;
        this.onChangeListeners = [];
        this.onStartListeners = [];
        this.onPauseListeners = [];
        this.staticEnabled = false;
    }

    // PLAY/PAUSE

    /**
     * Starts clock from 0
     */
    public start = (): void => {
        this.simTime = 0;
        this.isRunning = true;
        this.lastUpdate = performance.now();

        this.executeOnTimeChangeListeners();
        this.executeOnStartListeners();
    }

    /**
     * Pauses clock
     */
    public pause = (): void => {
        this.isRunning = false;

        this.executeOnTimeChangeListeners();
        this.executeOnPauseListeners();
    }

    /**
     * Unpauses clock
     */
    public unPause = (): void => {
        this.isRunning = true;
        this.lastUpdate = performance.now();

        this.executeOnTimeChangeListeners();
        this.executeOnStartListeners();
    }

    // UPDATING CLOCK

    /**
     * Update simulation time
     */
    public updateSimTime = (): void => {
        if( this.isRunning) {
            const now =  performance.now();
            const nextSimTime = this.simTime + (now - this.lastUpdate)*this.speed;
    
            this.simTime = nextSimTime;
            this.lastUpdate = now;
    
            this.executeOnTimeChangeListeners();
        }
    }

    // SETTERS

    /**
     * Sets this.simTime
     * @param timeInS new time in seconds
     */
    public setSimTimeInS = ( timeInS: number ): void => {
        this.simTime = timeInS*1000;
        this.executeOnTimeChangeListeners();
    }

    /**
     * Set this.speed
     * @param speed new speed
     */
    public setSpeed = (speed: number): void => {
        this.speed = speed;
    }

    // GETTERS

    /**
     * Returns simulation time in MilliSeconds
     */
    public getSimTimeinMS = (): number => {
        return this.simTime;
    }

    /**
     * Returns simulation time in seconds
     */
    public getSimTimeinS = (): number => {
        return this.simTime/1000;
    }

    /**
     * Returns simTime in hourse : minutes : seconds
     */
    public getSimTimeInHMS = (): string => {
        let timeLeft = this.simTime / 1000;
        const hours = Math.floor(timeLeft / 3600);
        timeLeft -= hours*3600;
        const minutes = Math.floor(timeLeft / 60);
        timeLeft -= minutes*60;
        const seconds = timeLeft;
        return [hours, minutes, seconds.toFixed(0)].join(':')
    }

    /**
     * Returns simTime in hours : minutes
     */
    public getSimTimeInHM = (): string => {
        let timeLeft: number = this.simTime / 1000;
        
        const hours: number = Math.floor(timeLeft / 3600);
        const hh = (hours < 10) ? '0'+hours.toString() : hours.toString();
        timeLeft -= hours*3600;

        const minutes: number = Math.floor(timeLeft / 60);
        const mm: string = (minutes <= 9) ? '0'+minutes.toString() : minutes.toString();
        return hh+'h'+mm;
    }

    /**
     * Returns given time in hours : minutes
     * @param timeInS time to convert
     */
    public convertTimeInHM = ( timeInS: number ): string => {
        let timeLeft: number = timeInS;
        
        const hours: number = Math.floor(timeLeft / 3600);
        const hh = (hours < 10) ? '0'+hours.toString() : hours.toString();
        timeLeft -= hours*3600;

        const minutes: number = Math.floor(timeLeft / 60);
        const mm: string = (minutes <= 9) ? '0'+minutes.toString() : minutes.toString();
        return hh+'h'+mm;
    }

    /**
     * Returns simulation time in percentage
     */
    public getSimTimeInPercentage = (): number => {
        const simTimeInS =  this.simTime/1000;
        return simTimeInS/86400;
    }

    /**
     * Returns the time in seconds of a given progression percentage
     * @param percentage percentage of the progress of the simulation
     */
    public convertPercentageToSimTimeInHM = ( percentage: number ): string => {
        const simulatedSimTime = 86400 * percentage;

        let timeLeft: number = simulatedSimTime / 1000;
        
        const hours: number = Math.floor(timeLeft / 3600);
        const hh = (hours < 10) ? '0'+hours.toString() : hours.toString();
        timeLeft -= hours*3600;

        const minutes: number = Math.floor(timeLeft / 60);
        const mm: string = (minutes < 9) ? '0'+minutes.toString() : minutes.toString();

        return [hh, mm].join(':')
    }

    // EXECTUTE LISTENERS

    /**
     * Execute all onChangeListers
     */
    private executeOnTimeChangeListeners = (): void => {
        const eventInfo: IOnTimeChangeEvent = {
            simTimeInHMS: this.getSimTimeInHMS(),
            simTimeInHM: this.getSimTimeInHM(),
            simTimeInPercentage: this.getSimTimeInPercentage(),
        }
        this.onChangeListeners.forEach((listener) => listener(eventInfo));
    }
    /**
     * Execute all onStartListers
     */
    private executeOnStartListeners = (): void => {
        this.onStartListeners.forEach((listener) => listener());
    }/**
     * Execute all onPauseListers
     */
    private executeOnPauseListeners = (): void => {
        this.onPauseListeners.forEach((listener) => listener());
    }

    /**
     * Sets the staticEnabled property
     * @param value value for staticEnabled
     */
    public setStaticMode = (value: boolean): boolean => {
        this.staticEnabled = value;
        this.pause();
        return this.staticEnabled;
    }
}