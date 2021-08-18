// Node
import {
	Request,
	Response,
	NextFunction
} from 'express';
import { Pool } from 'pg';
import dayjs from 'dayjs';

// Helpers
import { convertToLegacyFormat } from '../helpers/convertToLegacyFormat';

// Types  
import { IObservationWithShower, IObservationWithShowerLegacy } from './d.types';

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
}