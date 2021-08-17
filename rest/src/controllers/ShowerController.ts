// Node
import express, {
	Request,
	Response,
	NextFunction
} from 'express';
import { Pool } from 'pg';

export default class ShowerController {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    get = async (req: RequestCache, res: Response, next: NextFunction) => {
        const q = await this.pool.query('SELECT showers.iau_code FROM showers;');
        console.log(q.rows);
        res.json({
            codes: q.rows
        })
    }
}