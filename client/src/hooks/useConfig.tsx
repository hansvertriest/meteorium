const useConfig = (): IConfig => {
    return {
        environment: process.env.REACT_APP_ENVIRONMENT as Environment | undefined,
        gaTrackingId: process.env.REACT_APP_GA_ID
    }
}

export default useConfig;

export enum Environment {
    development = 'development',
    production = 'production'
}

export interface IConfig {
    environment: Environment | undefined ,
    gaTrackingId: string | undefined,
}