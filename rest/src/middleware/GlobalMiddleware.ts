// Node
import express from 'express';

export default class GlobalMiddleware {
    private app: express.Application;

    constructor( app: express.Application ) {
        this.app = app;
    }

    public load = () => {
        this.app.use(express.json());
        this.app.use(express.urlencoded());
    }

}