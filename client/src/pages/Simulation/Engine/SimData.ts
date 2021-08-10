// Import types
import {
    IMeteorData,
    IFetchedMeteorData,
    IFetchedPirateMeteorDataFeature,
    IOnDataLoadedEvent,
    IMeteorsPosInShowerCollection,
} from './d.types'

export default class SimData {
    private apiUrl: string;
    private includeStatic: boolean;
    public selectedDate: Date;
    public meteors: IMeteorData[];
    public staticMeteors: IMeteorData[];
    public showers: IMeteorsPosInShowerCollection;

    // Listener collections
    public onDataLoadedListeners: { (e: IOnDataLoadedEvent): void }[];

    constructor() {
        this.apiUrl = process.env.REACT_APP_API_BASE || '';
        this.includeStatic = false;
        this.meteors = [];
        this.staticMeteors = [];
        this.selectedDate = new Date("2016-12-14");
        this.onDataLoadedListeners = [];
        this.showers = {}
    }

    /**
     * Set date and fetch meteors for that date
     * @param date date to be set
     */
    public selectDate = async ( date = this.selectedDate ): Promise<void> => {
        this.selectedDate = date;
        await this.fetchMeteors(date);
        if (this.includeStatic) await this.fetchPiratedMeteors();
    }

    /**
     * Fetch meteors from server
     * @param date date from which to fetch meteors
     */
    public fetchMeteors = async (date: Date = this.selectedDate): Promise<void> => {
        const dateString = date.toISOString().substring(0, 10);
        const fetchMeteors = await fetch(
            this.apiUrl + 'meteors/' + dateString,

        )
            .then((response) => response.json())
            .catch(() => {
                console.log("Could not fetch data from server")
                return {};
            })
        
        if (fetchMeteors.meteors) {
            const meteorsPosInShowerCollection: IMeteorsPosInShowerCollection = {};
            const meteors: IMeteorData[] = fetchMeteors.meteors.map(( meteorData: IFetchedMeteorData ) => {
                const formatedMeteorData = meteorData as unknown as IMeteorData;
    
                // convert km to m
                formatedMeteorData.hBegin *= 1000
                formatedMeteorData.hEnd *= 1000
    
                // convert time to milliseconds
                const timeComponents = meteorData.time.split(':').map((timeComponent: string) => Number(timeComponent))
                formatedMeteorData.timeFromZeroPointInS = timeComponents[0]*3600+timeComponents[1]*60+timeComponents[2];


                // Add position to meteorsPosInShowerCollection
                if (!meteorsPosInShowerCollection[formatedMeteorData.iauCode]) meteorsPosInShowerCollection[formatedMeteorData.iauCode] = [];
                meteorsPosInShowerCollection[formatedMeteorData.iauCode].push({
                    lon: formatedMeteorData.lonBegin, 
                    lat: formatedMeteorData.latBegin, 
                    h:formatedMeteorData.hBegin
                });
    
                return formatedMeteorData;
            });
    
            this.meteors = meteors;
            this.showers = meteorsPosInShowerCollection;
            this.executeOnDataLoadedListeners();

        }
    }

    /**
     * Fetch meteors from seti.cams.org
     * @param date date from which to fetch meteors
     */
    public fetchPiratedMeteors = async (date: Date = this.selectedDate): Promise<void> => {
        const dateString = date.toISOString().substring(0, 10).replaceAll('-', '_');
        const url = 'http://cams.seti.org/FDL/json/ALL/ALL'+dateString+'_00_00_00.json';
        const fetchMeteors = await fetch(
           url,

        )
        .then(response => response.json())

        const meteors: IMeteorData[] = fetchMeteors.features.map(( meteorData: IFetchedPirateMeteorDataFeature ) => {
            return {
                "date": this.selectDate,
                "hBegin": 200000,
                "hEnd": 0,
                "iauNo": 0,
                "latBegin": meteorData.geometry.coordinates[1],
                "latEnd": 0,
                "lonBegin": meteorData.geometry.coordinates [0],
                "lonEnd": 0,
                "name": meteorData.properties.name.toString(),
                "stations": 1,
                "tBegin": 0,
                "tEnd": 0,
                "network": 1,
                "end": '*',
                "start": '*',
                "parent": '*',
                "iauCode": '*',
            }
        });

        this.staticMeteors = meteors || [];
        this.executeOnDataLoadedListeners()
    }

    // GETTERS

    /**
     * Get string of selectedDate [YYYY-MM-DD]
     */
    public getSelectedDateString = (): string => {
        const dd = String(this.selectedDate.getDate()).padStart(2, '0');
        const mm = String(this.selectedDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        const yyyy = this.selectedDate.getFullYear();

        return yyyy + '-' + mm + '-' + dd;
    }

    // EXECTUTE LISTENERS

    /**
     * Execute all onChangeListers
     */
    private executeOnDataLoadedListeners = (): void => {
        const eventInfo: IOnDataLoadedEvent = {
            meteors: this.meteors,
            staticMeteors: this.staticMeteors,
            date: this.selectedDate,
        }
        this.onDataLoadedListeners.forEach((listener) => listener(eventInfo));
    }



}