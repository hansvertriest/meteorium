// Node
import express, {
	Request,
	Response,
	NextFunction
} from 'express';
import { Pool } from 'pg';

// Helpers
import { convertToLegacyFormat } from '../helpers/convertToLegacyFormat';

// Types  
import { IObservationWithShower, IObservationWithShowerLegacy } from './d.types';

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
}