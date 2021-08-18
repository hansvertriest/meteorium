// Node
import express, {
	Request,
	Response,
	NextFunction
} from 'express';
import { Pool } from 'pg';

// Helpers
import { convertToLegacyFormat } from '../helpers/convertToLegacyFormat';
import { captilizeFirstChar } from '../helpers/stringHelpers';

// Types
import { IShower, IShowerLegacy } from './d.types'

export default class ShowerController {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    get = async (req: Request, res: Response, next: NextFunction) => {
        const { iauCode } = req.params;

        try {
            const q = await this.pool.query(`
                SELECT *
                FROM showers
                WHERE showers.iau_code='${iauCode.toUpperCase()}';
            `);

            if (q.rows.length === 0) throw {code: 404, msg: 'Could not find any showers.'}
            
            const result: IShower[] = convertToLegacyFormat(q.rows);

            res.json(result[0])
        } catch (error) {
            if (error.msg) return res.status(404).json({error: error.msg});
            return res.status(500).json({msg: 'Internal server error.'});
        }
    }


    search = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
        const { word } = req.params;

        try {
            const q = await this.pool.query<IShowerLegacy>(`
                SELECT * 
                FROM showers
                WHERE showers.name LIKE '${word}%'
                OR showers.name LIKE '${captilizeFirstChar(word)}%'
                OR showers.name LIKE '% ${word}%'
                OR showers.name LIKE '% ${captilizeFirstChar(word)}%';
            `)

            if (q.rows.length === 0) throw {code: 404, msg: 'Could not find any showers.'}

            const result: IShower[] = convertToLegacyFormat(q.rows);

            return res.json(result);

        } catch (error) {
            if (error.msg) return res.status(404).json({error: error.msg});
            return res.status(500).json({msg: 'Internal server error.'});
            
        }
    }
}