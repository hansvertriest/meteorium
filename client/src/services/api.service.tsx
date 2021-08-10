import { default as React,  useContext, createContext, FunctionComponent } from "react";


// Import types
import {
    IShowerInfo
} from '../pages/Simulation/Engine/d.types';
import {
    ITopDate, 
    IYearlyCount
} from './d.types';

interface IApiProvider {
    children:  React.ReactNode
}

interface IAPiContext {
    getShowerSearchResults: (searchTerm: string) => Promise<IShowerInfo[]>,
    getShowerInfo: (IauCode: string) => Promise<IShowerInfo>,
    getTopDates: (params: any) => Promise<{dates: ITopDate[], max_count: number}>,
    getYearlyCount: () => Promise<IYearlyCount>,
    
}

const ApiContext = createContext({});
const useApi = (): IAPiContext => useContext(ApiContext) as IAPiContext;

const ApiProvider: FunctionComponent<IApiProvider> = ({children}: IApiProvider) => {
    const baseUrl = process.env.REACT_APP_API_BASE || '';


    /**
     * Gets info about shower
     * @param IauCode iaucode of shower to be fetched
     */
    const getShowerSearchResults = async ( searchTerm: string ): Promise<IShowerInfo[]> => {
        console.log('FETCH');
        const url = `${baseUrl}showers/search/${searchTerm}`;
    
        const options = {
          method:'GET',
          headers: new Headers({
              'Content-Type': 'application/json',
            }), 
        }
    
        const response = await fetch(url, options).then((result) => result.json());
    
        return response;
    }

    /**
     * Gets info about shower
     * @param IauCode iaucode of shower to be fetched
     */
    const getShowerInfo = async ( IauCode: string ): Promise<IShowerInfo> => {
        const url = `${baseUrl}/showerinfo/${IauCode}`;
    
        const options = {
          method:'GET',
          headers: new Headers({
              'Content-Type': 'application/json',
            }), 
        }
    
        const response = await fetch(url, options).then((result) => result.json());
    
        return response;
    }

    /**
     * Gets date with highes meteor frequency filteered by params
     * @param params for date-query
     */
    const getTopDates = async (params: any): Promise<{dates: ITopDate[], max_count: number}> => {
        const url = new URL(baseUrl+'topdates');
        Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]))

        const options = {
            method:'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
              }), 
          }

        const fetchTopDates = await fetch(url.toString(), options).then((response) =>response.json());
        
        return fetchTopDates;
    }

    /**
     * Gets meteor-freq of available years and months
     */
    const getYearlyCount = async (): Promise<IYearlyCount> => {
        const url = new URL(baseUrl+'count/month');

        const options = {
            method:'GET',
            headers: new Headers({
                'Content-Type': 'application/json',
              }), 
          }

        const yearlyCount = await fetch(url.toString(), options).then((response) =>response.json());
        return yearlyCount;
    }

    return (
        <ApiContext.Provider 
            value={{
                getShowerSearchResults,
                getShowerInfo,

                getTopDates,
                getYearlyCount
            }}
        >
          {children}
        </ApiContext.Provider>
    );
};
    
export {
    ApiContext,
    ApiProvider,
    useApi,
}
