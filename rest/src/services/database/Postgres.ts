// Node
import { Pool } from 'pg';

// Types
import { IPostgresConfig } from '../config/config.types';

export default class Postgres {
    private config: IPostgresConfig;
    public pool: Pool;
    
    constructor(config: IPostgresConfig) {
        this.config = config;
        this.createPool();

    }

    private createPool = () => {
        this.pool = new Pool({connectionString: this.config.conectionString});
    }
}