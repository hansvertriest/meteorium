export interface IObservationWithShower {
    time?: string,
    date?: string, 
    t_begin?: number,
    t_end?: number,
    lat_begin?: number,
    lon_begin?: number,
    h_begin?: number,
    lat_end?: number,
    lon_end?: number,
    h_end?: number,
    iau_no?: string,
    stations?: string,
    network?:number,
    iau_code?: string,
    name?: string,
    parent?: string,
    start?: string | null,
    end?: string | null,
    peak?: string | null,
    speed?: number | null,
    freq_per_hour?: number | null,
}

export interface IObservationWithShowerLegacy {
    time?: string,
    date?: string, 
    tBegin?: number,
    tEnd?: number,
    lonBegin?: number,
    lonEnd?: number,
    hBegin?: number,
    latBegin?: number,
    latEnd?: number,
    hEnd?: number,
    iauNo?: number,
    stations?: string,
    network?:number,
    iauCode: string,
    name?: string,
    parent?: string,
    start?: string | '*',
    end?: string | '*',
    peak?: string | '*',
    speed?: number | '*',
    freq_per_hour?: number | '*',
}