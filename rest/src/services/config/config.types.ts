export interface IConfig {
    server: IServerConfig;
    postgres: IPostgresConfig;
}

export interface IServerConfig {
    port: number;
    host: string;
}


export interface IPostgresConfig {
    conectionString: string
}