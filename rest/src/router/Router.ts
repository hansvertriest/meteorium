// Node
import express from 'express';
import { Pool } from 'pg';

// Classes
import { ShowerController } from '../controllers';

export default class Router {
    private pool: Pool;
    private app: express.Application;

    private showerController: ShowerController;

    constructor( app: express.Application, pool: Pool ) {
        this.app = app;
        this.pool = pool;

        this.registerControllers();
        this.registerRoutes();
    }

    registerControllers = () => {
        this.showerController = new ShowerController(this.pool);
    }

    registerRoutes  = () => {
        this.app.get('/shower-codes', this.showerController.get);
    }
}