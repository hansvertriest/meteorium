// Node
const dotenv = require('dotenv');
dotenv.config({ path: `.env.${(process.env.NODE_ENV === 'development') ? 'local' : ''}` });

// types
import { IServerConfig, IConfig, IPostgresConfig } from './config.types';

export default class Config implements IConfig {
    public server: IServerConfig;
    public postgres: IPostgresConfig;

    constructor() {
        dotenv.config();
        this.createServerConfig();
        this.createPostgresConfig();
    }

    private createServerConfig = (): void => {
        this.server = {
            port: Number(process.env.NODE_PORT),
            host: process.env.NODE_HOST
        }
    }

    private createPostgresConfig = (): void => {
        this.postgres = {
            conectionString: process.env.POSTGRES_STRING,
        }
    }
}