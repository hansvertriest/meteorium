// Class imports 
import Simulation from '../Simulation';

// Type imports
import {
    IMeteorMeshUserData
} from '../d.types';

export default class MeteorControls {
    private simulation: Simulation;

    constructor( simulation: Simulation ) {
        this.simulation = simulation;
    }

    /**
     * Highlights meeteors from different networks
     */
    public highlightPerNetwork = (): void => {
        this.simulation.meteors.forEach((meteor) => {
            meteor.highlightPerNetwork();
        });
    }

    /**
     * Removes highlight per network
     */
    public removeAllHighlight = (): void => {
        this.simulation.meteors.forEach((meteor) => {
            meteor.removeHighlight();
        });
    }

    /**
     * Highlights meeteors from different networks
     */
    public highlightPerShower = ( iauCode: string ): void => {
        // Reset highlighting
        this.removeAllHighlight();
        // Highlight by shower
        this.simulation.meteors
            .filter((meteor) => meteor.properties.iauCode === iauCode)
            .forEach((meteor) => {
                meteor.highlight(0xC33C54);
            });
    }

    /**
     * Find the time in s of the first recorded meteor in a specified network
     * @param network number of network
     */
    public findTimeOfFirstMeteorsRecordedInNetwork = ( network: number ): { 
        meteorPresent: boolean,
        lon: number,
        lat: number,
        time: number
     } => {
        // Filter out meteors from other network
        const meteorsOfNetwork = this.simulation.data.meteors.filter((meteor) => meteor.network === network);

        // Find first meteor and calculate total lon and lat
        let firstAppearanceInS = 24 * 60 * 60;
        let totalLon = 0;
        let totalLat = 0;

        meteorsOfNetwork.forEach((meteor) => {
            if (meteor.timeFromZeroPointInS < firstAppearanceInS) firstAppearanceInS = meteor.timeFromZeroPointInS;
            totalLat += meteor.latBegin;
            totalLon += meteor.lonBegin;
        });

        // calculate mean lon lat
        const meanLon = totalLon / meteorsOfNetwork.length;
        const meanLat = totalLat / meteorsOfNetwork.length;

        return {
            meteorPresent: meteorsOfNetwork.length > 0,
            lon: meanLon,
            lat: meanLat,
            time: firstAppearanceInS,
        };
    }

    /**
     * Find the time in s of the first recorded meteor in a specified meteor shower
     * @param iauCode code ofshower
     */
    public findTimeOfFirstMeteorsRecordedInShower = ( iauCode: string ): { 
        meteorPresent: boolean,
        lon: number,
        lat: number,
        time: number
     } => {
        // Filter out meteors from other network
        const meteorsOfShower = this.simulation.data.meteors.filter((meteor) => meteor.iauCode === iauCode);

        // Find first meteor 
        let firstAppearanceInS = 24 * 60 * 60;
        let firstAppearanceLon = 0;
        let firstAppearanceLat = 0;

        meteorsOfShower.forEach((meteor) => {
            if (meteor.timeFromZeroPointInS < firstAppearanceInS) {
                firstAppearanceInS = meteor.timeFromZeroPointInS;
                firstAppearanceLon = meteor.lonBegin;
                firstAppearanceLat = meteor.latBegin;
            }
        });


        return {
            meteorPresent: meteorsOfShower.length > 0,
            lon: firstAppearanceLon,
            lat: firstAppearanceLat,
            time: firstAppearanceInS,
        };
    }

    /**
     * Return a list of th IAU code and name of all showers visible at current date
     */
    public getAvailableShowerNameAndIauCodes = (): {iauCode: string, name: string, count: number}[] => {
        const showers: {iauCode: string, name: string, count: number}[] = [];
        this.simulation.data.meteors.forEach((meteor) => {
            if (showers.map((shower) => shower.iauCode).includes(meteor.iauCode)) {
                showers.filter((shower) => shower.iauCode === meteor.iauCode)[0].count += 1;
            } else {
                showers.push({iauCode: meteor.iauCode, name: meteor.name, count: 1});
            }
        });

        return showers;
    }


    public addMeteorHoverListener = (listener: {(meshData: IMeteorMeshUserData): void}): void => {
        this.simulation.context.mouseController.MeteorHoverListenerCollection.push(listener);
    }

    public addMeteorHoverOutListener = (listener: {(): void}): void => {
        this.simulation.context.mouseController.MeteorHoverOutListenerCollection.push(listener);
    }

    public addMeteorClickOutListener = (listener: {(meshData: IMeteorMeshUserData): void}): void => {
        this.simulation.context.mouseController.MeteorClickListenerCollection.push(listener);
    }
}