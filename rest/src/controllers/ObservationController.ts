// Node
import {
	Request,
	Response,
	NextFunction
} from 'express';
import { Pool } from 'pg';
import dayjs from 'dayjs';

// Helpers
import {
    convertToLegacyFormat,
    convertDateToLegacy
} from '../helpers/convertToLegacyFormat';
import { getDeltaDegreeOfVisibilityCone } from '../helpers/calculations';

// Types  
import {
    IObservationWithShower,
    IObservationWithShowerLegacy,
    IShowerAtLocationLegacy
} from './d.types';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default class ObservationController {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    getAtDate = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { date } = req.params;

        try {
            // Parse to YYMMDD
            const dateComponents = date.split('-');
            const dateParsed = dateComponents[2]+dateComponents[1]+dateComponents[0];

            if (dateParsed.length !== 6 && dateParsed.length !== 8) throw {code: 412, msg: 'Date is not structured as "dd-mm-yy" or "dd-mm-yyyy"'}

            const q = await this.pool.query<IObservationWithShowerLegacy>(`
                SELECT * 
                FROM observations
                FULL JOIN showers
                ON observations.iau_no=showers.iau_no
                WHERE observations.date='${dateParsed}';
            `);

            if (q.rows.length === 0) throw {code: 404, msg: 'Could not find any observations at this date.'}

            const result: IObservationWithShower[] = convertToLegacyFormat(q.rows);
            
            return res.json({
                date,
                meteors: result,
            })
        } catch (error) {
            if (error.msg) return res.status(404).json({error: error.msg});
            return res.status(500).json({msg: 'Internal server error.'});
            
        }
    }

    getMonthlyMeteorCount = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        try {
            interface IRow {date: string, freq: number};

            const qDailyFrequencies = await this.pool.query<IRow>(`
                SELECT 
                    count(observations.date) as freq,
                    observations.date as date
                FROM observations
                GROUP BY date
                ORDER BY date ASC
            `);

            if (qDailyFrequencies.rows.length === 0) throw {code: 404, msg: 'Could not find any observations.'}

            // Loop through rows and order in year-arrays
            const dailyFreqPerYear: {[index: string]: IRow[]} = {};
            qDailyFrequencies.rows.forEach((row) => {
                const date = dayjs(row.date);
                const year = date.year();

                // create year and add to it
                if (!dailyFreqPerYear[year]) dailyFreqPerYear[year] = []
                dailyFreqPerYear[year].push(row);
            })

            // Loop through years
            const yearsArray = [];
            let maxYearlyCount = 0;
            Object.keys(dailyFreqPerYear).forEach((year) => {
                const yearRows = dailyFreqPerYear[year];
                const monthColletionObj: {[index: number]: {count: number, name: string}} = {};
                let maxMonthlyCount = 0;
                let totalObservations = 0;
                // loop through year-rows
                yearRows.forEach((row) => {
                    const date = dayjs(row.date);
                    const month = monthNames[date.month()];
                    
                    // add to totalObservations
                    totalObservations += Number(row.freq);
                    
                    // create month object and add to monthColletionObj
                    if (!monthColletionObj[month]) monthColletionObj[month] = {count: 0, name: month.toString()};
                    monthColletionObj[month].count = (Number(monthColletionObj[month].count) + Number(row.freq)).toString();
                })


                // Convert monthColletionObj to an array of monthObj's
                const monthsArray: {count: number, name: string}[] = [];
                Object.keys(monthColletionObj).forEach((monthName) => {
                    const month: {count: number, name: string} = monthColletionObj[monthName];
                    if (Number(maxMonthlyCount) < Number(month.count)) maxMonthlyCount = month.count;
                    monthsArray.push(month);
                })

                // check if this year's totalObservations is max
                if (maxYearlyCount < totalObservations) maxYearlyCount = totalObservations;

                // create year object and add it to yearsArray
                const resultYear = {
                    name: year,
                    max_monthly_count: maxMonthlyCount.toString(),
                    total_observations: totalObservations,
                    months: monthsArray,
                }
                yearsArray.push(resultYear)
            })
            
            return res.json({
                max_yearly_count: maxYearlyCount,
                years: yearsArray
            })
        } catch (error) {
            if (error.msg) return res.status(404).json({error: error.msg});
            console.log(error)
            return res.status(500).json({msg: 'Internal server error.'});
            
        }
    }

    getTopDates = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { limit, shower: showerCode, year, month } = req.query;

        const isDefined = (value) => {
            return value !== undefined && value !== '';
        } 
        
        try {
            let dateUnderLimit = dayjs()
                .year((isDefined(year)) ? year : 2000)
                .month((isDefined(month)) ? Number(month) - 1 : 0)
                .date(1)
            let dateUpperLimit = dayjs()
                .year((isDefined(year)) ? year : 3000)
                .month((isDefined(month)) ?  Number(month) - 1 : 11)
                .date(dateUnderLimit.daysInMonth())

            let queryString = `
                SELECT 
                    DATE_TRUNC('day', observations.date)
                        AS date,
                    COUNT(observations.date) AS count
                FROM observations
                LEFT JOIN showers ON observations.iau_no=showers.iau_no
                WHERE showers.iau_code LIKE '${(showerCode) ? showerCode.toUpperCase() : '%'}'
                    AND observations.date BETWEEN to_date('${dayjs(dateUnderLimit).format('YYYY-MM-DD')}','YYYY-MM-DD') 
                                    AND to_date('${dayjs(dateUpperLimit).format('YYYY-MM-DD')}','YYYY-MM-DD')
                GROUP BY DATE_TRUNC('day', observations.date)
                ORDER BY count DESC
                ${(limit) ? 'LIMIT ' + limit : ''};
            `;


            const q = await this.pool.query<{date: string, count: number}>(queryString);

            const resultLegacy: {date: string, count: number}[] = q.rows.map((row) => {
                return {
                    count: row.count,
                    date: convertDateToLegacy(new Date(row.date))
                }
            })

            const resultLegacySorted = resultLegacy.sort((a, b) => (Number(a.count) < Number(b.count)) ? 1 : -1);

            if (q.rows.length === 0) throw {code: 404, msg: 'Could not find any observations at this date.'}

            return res.json({
                dates: resultLegacySorted
            })
        } catch (error) {
            if (error.msg) return res.status(404).json({error: error.msg});
            console.log(error);
            return res.status(500).json({msg: 'Internal server error.'});
            
        }
    }



    getMeteorsAtLocation = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { lon, lat, height = 100 } = req.query;
        

        try {
            if (!lon || lon === '' || !lat && lat === '' || height === '') throw {code: 412, msg: 'Query params do not match specified requirements.'}
            
            const deltaDegree = getDeltaDegreeOfVisibilityCone(Number(height));
            
            let showersQuery = `
                SELECT DISTINCT ON (max_count_per_date_per_iau.iau_no)
                    max_count_per_date_per_iau.date,
                    max_count_per_date_per_iau.time AS best_date_first_meteor_time,
                    observations_total_count.total_count AS best_recorded_date,
                    showers.start,
                    showers.end,
                    showers.iau_code,
                    showers.name
                    
                FROM
                (
                    SELECT 
                        counted_observations.iau_no,
                        MAX(counted_observations.count) as max_count_date,
                        counted_observations.date,
                        observations_first_meteor.time
                    
                    FROM
                        (
                        SELECT 
                            observations.iau_no,
                            observations.date,
                            COUNT(observations.iau_no) AS count
                        FROM observations
                        WHERE 
                            (observations.lat_begin BETWEEN ${Number(lat) - deltaDegree} AND ${Number(lat) + deltaDegree})
                            AND (observations.lon_begin BETWEEN ${Number(lon) - deltaDegree} AND ${Number(lon) + deltaDegree})
                        GROUP BY 
                            observations.date,
                            observations.iau_no
                        ) counted_observations
                    FULL JOIN 
                        (
                        SELECT DISTINCT ON (observations.iau_no, observations.date)
                            observations.time,
                            observations.iau_no,
                            observations.date
                        FROM observations
                        WHERE 
                            (observations.lat_begin BETWEEN ${Number(lat) - deltaDegree} AND ${Number(lat) + deltaDegree})
                            AND (observations.lon_begin BETWEEN ${Number(lon) - deltaDegree} AND ${Number(lon) + deltaDegree})
                        ORDER BY
                            observations.iau_no,
                            observations.date,
                            observations.time ASC
                        ) observations_first_meteor
                        ON 
                            observations_first_meteor.iau_no=counted_observations.iau_no AND
                            observations_first_meteor.date=counted_observations.date
                    
                    GROUP BY 
                        counted_observations.iau_no,
                        counted_observations.date,
                        observations_first_meteor.time
                    ORDER BY counted_observations.iau_no ASC	
                ) max_count_per_date_per_iau
                FULL JOIN 
                    (
                    SELECT 
                        counted_observations.iau_no,
                        SUM(counted_observations.count) as total_count
                    FROM 
                        (SELECT 
                                observations.iau_no,
                                COUNT(observations.iau_no) AS count
                            FROM observations
                        WHERE 
                            (observations.lat_begin BETWEEN ${Number(lat) - deltaDegree} AND ${Number(lat) + deltaDegree})
                            AND (observations.lon_begin BETWEEN ${Number(lon) - deltaDegree} AND ${Number(lon) + deltaDegree})
                            GROUP BY 
                                observations.iau_no
                        ) counted_observations
                    GROUP BY 
                        counted_observations.iau_no
                    ) observations_total_count
                    ON 
                        observations_total_count.iau_no=max_count_per_date_per_iau.iau_no
                LEFT JOIN showers
                    ON max_count_per_date_per_iau.iau_no=showers.iau_no 
                ORDER BY 
                    max_count_per_date_per_iau.iau_no, 
                    max_count_per_date_per_iau.max_count_date DESC
                ;
            `

            const q = await this.pool.query<IShowerAtLocationLegacy>(showersQuery);

           let rowsFormated = convertToLegacyFormat(q.rows);


            res.json({
                showers: rowsFormated
            })

            
        } catch (error) {
            if (error.msg) return res.status(404).json({error: error.msg});
            console.log(error)
            return res.status(500).json({msg: 'Internal server error.'});
            
        }
    }
}