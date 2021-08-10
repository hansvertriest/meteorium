// Class imports 
import Simulation from '../Simulation';

// Type imports
import { 
    IMeteorData,
    IOnDataLoadedEvent,
    IOnTimeChangeEvent,
    IContinentMeteorFrequencies,
} from '../d.types'

export default class TimeControls {
    private simulation: Simulation;

    constructor( simulation: Simulation  ) {
        this.simulation = simulation;
    }

    // ADD EVENT LSITENERS
    /**
     * Adds an eventListener for a certain eventType
     * @param callback callback-function to be executed oon event-trigger
     */
    public addOnTimeChangedEventListener = ( callback: { (e: IOnTimeChangeEvent ): void } ): void => {
        this.simulation.clock.onChangeListeners.push(callback);
    }
    public addOnDataLoadedEventListener = ( callback: { (e: IOnDataLoadedEvent ): void } ): void => {
        this.simulation.data.onDataLoadedListeners.push(callback);
    }
    public addOnSimPauseEventListeners = ( callback: { (): void } ): void => {
        this.simulation.clock.onPauseListeners.push(callback);
    }
    public addOnSimStartEventListeners = ( callback: { (): void } ): void => {
        this.simulation.clock.onStartListeners.push(callback);
    }

    // SETTERS

    /**
     * Toggels running-state of Clock
     * @param bool? true = start false = stop
     */
    public toggleRunning = ( bool? : boolean ): boolean => {
        if (bool !== undefined) {
            if (bool) this.simulation.clock.unPause();
            if (!bool) this.simulation.clock.pause();
        } else if (this.simulation.clock.isRunning) {
            this.simulation.clock.pause();
        } else {
            this.simulation.clock.unPause();
        }

        return this.simulation.clock.isRunning;
    }

    /**
     * Sets the simTime of the clock to a time calculated by a given percentage of the day
     * @param percentage percentage of the day that has passed
     */
    public setSimulationProgressInPercentage = ( percentage: number ): void => {
        const time = percentage * 86400;
        this.simulation.clock.setSimTimeInS(time);
        this.updateClock();
    }

    /**
     * Sets the time of the simulation
     * @param timeInS time in seconds
     */
    public setTime = ( timeInS: number ): void => {
        this.simulation.clock.setSimTimeInS(timeInS);
        this.simulation.clock.unPause();
    }

    /**
     * Make the clock updatee it's simTime
     */
    public updateClock = (): void => {
        this.simulation.clock.updateSimTime();
    }

    /**
     * Sets the simulations speed
     * @param speed speed to update this.simulation.clock.speed to
     */
    public setSpeed = ( speed: number ): void => {
        this.simulation.clock.setSpeed(speed);
    }

    /**
     * Returns the amount of meteors per second at a given speed
     * @param speed speed of the simulation
     */
    public getAvgMeteorsPerSecond = ( speed: number ): number => {
        return this.simulation.meteors.length / 86400 * speed;
    }


    /**
     * Selects a date in SimaData
     * @param date 
     */
    public selectDate = ( date: Date, timeInS?: number, position?: {lon: number, lat: number}, height?: number, fpMode?: boolean, useExistingData?: boolean  ): void => {
        if (!position) {
            const currentPosition = this.simulation.context.getCameraGetodeticCoords()
            this.simulation.initSim(date, timeInS, currentPosition, currentPosition?.hInUnits, fpMode, useExistingData);
        } else {
            this.simulation.initSim(date, timeInS, position, height, fpMode, useExistingData);
        }
    }
    
    /**
     * Sets the mode to static
     */
    public toggleStaticMode = ( ): boolean => {
        this.simulation.clock.setStaticMode(!this.simulation.clock.staticEnabled);
        return this.simulation.clock.staticEnabled;
    }

    // GETTERS

    /**
     * Returns a boolean of wether the clock is running or not
     */
    public getIsRunning = (): boolean => {
        return this.simulation.clock.isRunning;
    }

    /**
     * Returns simTime in hours: minutes at a giveen progression-percentage
     * @param percentage percentage of time passed in simualtion
     */
    public getTimeInHMFromPercentage = ( percentage: number ): string => {
        return this.simulation.clock.convertPercentageToSimTimeInHM(percentage)
    }

    /**
     * Returns all meteorData
     */
    public getMeteorData = (): IMeteorData[] => {
        return this.simulation.data.meteors;
    }

    /**
     * Get currently selected date
     */
    public getSelectedDate = (): Date => {
        return this.simulation.data.selectedDate;
    }

    /**
     * Calculates the frequency of meteors per continent for a given interval
     * @param intervalInS interval-length to calculate frequencies of
     */
    public getFrequencyOfMeteorsPerContinent( intervalInS: number ): IContinentMeteorFrequencies[] {
        const frequenciesPerContinent: IContinentMeteorFrequencies[] = [];
        const amountOfIntervals = 86400/intervalInS;
        const valueUnderLimits: number[] = [];

        const emptyFrequencies: { name: number, value: number }[] = [];

        // define under limits of intervals
        for( let intervalNr = 0; intervalNr < amountOfIntervals; intervalNr+=1 ) {
            valueUnderLimits.push(intervalNr*intervalInS);
            emptyFrequencies.push({name: intervalNr*intervalInS, value: 0});
        }

        
        // Fill up frequenciesPerContinent with continents
        const continents: {[continent: string] :number[]} = {
            'Unknown': [0],
            'North-america': [1, 2, 6],
            'Europe': [3],
            'Australia': [5],
            'Mid-Atlantic': [4],
            'Middle-East': [7],
        };
        Object.keys(continents).forEach((continent) => {
            // Deep cloning emptyFrequencies
            const emptyFrequenciesClone = JSON.parse(JSON.stringify(emptyFrequencies));
            frequenciesPerContinent.push({
                continent,
                intervalInS,
                intervalUnderLimits: valueUnderLimits,
                frequencies: emptyFrequenciesClone,
            });
        });

        // Calculate frequencies per continent
        this.simulation.data.meteors.forEach((meteor) => {
            // get index of interval of this meteor
            let intervalIndex: number | undefined;

            // if time is greater than biggest underlimit
            if ( valueUnderLimits[valueUnderLimits.length-1] < meteor.timeFromZeroPointInS ) {
                intervalIndex = valueUnderLimits.length-1;
            } else {
                // 
                let intervalIndexToBeChecked = 0;
                while (intervalIndex == undefined) {
                    if ( valueUnderLimits[intervalIndexToBeChecked] <= meteor.timeFromZeroPointInS && meteor.timeFromZeroPointInS < valueUnderLimits[intervalIndexToBeChecked+1] ) {
                        intervalIndex = intervalIndexToBeChecked;
                    }
                    intervalIndexToBeChecked += 1;
                }
            }

            // Get continent of the meteor
            const continentOfMeteor = Object.keys(continents).filter((continent) => continents[continent].includes(meteor.network))[0];
            // Get continentFrequency to add meteor to
            const continentFrequency = frequenciesPerContinent.filter((continentFrequency) => continentFrequency.continent === continentOfMeteor)[0];
            
            continentFrequency.frequencies[intervalIndex].value += 1;
        });
        
        return frequenciesPerContinent
    }

    /**
     * Get boolean of staticMode
     */
    public getIsStaticMode = (): boolean => {
        return this.simulation.clock.staticEnabled;
    }

}