export interface IMeteorData {
    "timeFromZeroPointInS": number,
    "date": string,
    "hBegin": number,
    "hEnd": number,
    "iauNo": number,
    "latBegin": number,
    "latEnd": number,
    "lonBegin": number,
    "lonEnd": number,
    "name": string,
    "stations": string,
    "tBegin": number,
    "tEnd": number,
    "network": number,
    "end": string,
    "start": string,
    "parent": string,
    "iauCode": string,
}

export interface IFetchedMeteorData {
    "time": string,
    "date": string,
    "hBegin": number,
    "hEnd": number,
    "iauNo": number,
    "latBegin": number,
    "latEnd": number,
    "lonBegin": number,
    "lonEnd": number,
    "name": string,
    "stations": string,
    "tBegin": number,
    "tEnd": number,
    "network": number,
    "end": string,
    "start": string,
    "parent": string,
    "iauCode": string,
}

export interface IFetchedPirateMeteorData {
   type: string,
   features: IFetchedPirateMeteorDataFeature[],
}

export interface IFetchedPirateMeteorDataFeature {
    geometry: {
        coordinates: number[]
    },
    properties: {
        color: string,
        mag: number,
        name: number,
        sol: number,
        velocg: number,
    },
    type: string,
}

export interface IPositionInUnits {
    x: number,
    y: number,
    z: number
}

export interface IPositionGeodetic {
    lon: number,
    lat: number,
    h: number,
}

export enum NetworkColor {
    '0x000000' = 0, // groen (Unknown)
    '0xffe710' = 1, // groen (California)
    '0xe36060' = 2, // rood (Florida)
    '0x3f88f4' = 3, // geel (BeNeLux)
    '0x87ff10' = 4, // licht blauw (Mid Atlantic)
    '0xffae10' = 5, // donker blauw (Nieuw Zeeland)
    '0x10fff1' = 6, // paars (Lowell Observatory CAMS)
    '0xff10d9' = 7, // roos (UAE Astronomical Camera Network)
}

export interface IOnTimeChangeEvent {
    simTimeInPercentage: number,
    simTimeInHMS: string,
    simTimeInHM: string,
}


export interface IOnDataLoadedEvent {
    meteors: IMeteorData[],
    staticMeteors: IMeteorData[],
    date: Date,
}
export interface IOnSimLoadStartEvent {
    date: Date,
    timeInHM: string,
    position: {lon: number, lat: number},
}

export interface IContinentMeteorFrequencies {
    continent: string,
    intervalInS: number,
    frequencies: { name: number , value: number }[],
    intervalUnderLimits: number[],
}

export interface IMeteorsPosInShowerCollection {
    [showername: string]: IPositionGeodetic[],
}

export interface IShowerInfo {
    end: string, 
    freqPerHour: number, 
    iauCode: string, 
    iauNo: number, 
    name: string, 
    parent: string, 
    peak: string, 
    speed: number, 
    start: string
}

export interface IMeteorMeshUserData {
    showerIauCode: string;
}