// Node
import express from 'express';
import { default as http, createServer, Server } from 'http';
import { Pool } from 'pg';

// Classes
import Router from './router/Router';
import GlobalMiddleware from './middleware/GlobalMiddleware';

// types
import { IConfig } from './services/config/config.types'

export default class App {
    public app: express.Application;
    public server: Server;
    private pgPool: Pool;
    private config: IConfig;
    private router: Router;

    constructor( config: IConfig, pool: Pool ) {
        this.config = config;
        this.pgPool = pool;

        this.createExpress();
        this.createServer();
        this.createRouter();
    }

    private createExpress = (): void => {
        this.app = express();
        const middleware = new GlobalMiddleware(this.app);
        middleware.load();
    }

    private createServer(): void {
        this.server = createServer(this.app);
        this.server.on('listening', () => {
            console.log('Server listening at ' + this.config.server.host + ':' + this.config.server.port)
        });
        this.server.on('error', (error?: Error) => {
            this.gracefulShutdown(error);
        });
        this.server.on('close', () => {
          console.log('Server is closed!', {});
        });
    }

    private createRouter = (): void => {
        this.router = new Router(this.app, this.pgPool);
    }

    public start = (): void => {
        this.server.listen(this.config.server.port, this.config.server.host);
    }

    public stop = (): void => {
        this.server.close((error?: Error) => {
          this.gracefulShutdown(error);
        });
      }

    private gracefulShutdown = (error?: Error): void => {
        console.log('Server gracefully shutdown');
    
        if (error) {
          process.exit(1);
        }
        process.exit();
      }
}

