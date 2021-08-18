// Node
import express from 'express';
import { Pool } from 'pg';

// Classes
import { ShowerController, ObservationController } from '../controllers';

export default class Router {
    private pool: Pool;
    private app: express.Application;

    private showerController: ShowerController;
    private observationController: ObservationController;

    constructor( app: express.Application, pool: Pool ) {
        this.app = app;
        this.pool = pool;

        this.registerControllers();
        this.registerRoutes();
    }

    registerControllers = () => {
        this.showerController = new ShowerController(this.pool);
        this.observationController = new ObservationController(this.pool);
    }

    registerRoutes  = () => {
        this.app.get('/shower-codes', this.showerController.get);
        this.app.get('/meteors/:date', this.observationController.getAtDate);
        
    }
}