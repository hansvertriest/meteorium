
// Results from fetches

export interface ITopDate {
    count: string,
    date: string
}

export interface IYearCount {
    max_monthly_count: string,
    total_observations: string,
    months: IMonthCount[],
    name: string,
}

export interface IYearlyCount {
    max_yearly_count: string,
    years: IYearCount[],
}

export interface IMonthCount {
    count: string,
    name: string,
}