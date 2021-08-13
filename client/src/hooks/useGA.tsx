// Node imports
import React, { useEffect, useState } from 'react'
import ReactGA from 'react-ga';
import { useLocation } from 'react-router-dom';

// Hook imports
import { useConfig, Environment } from '../hooks';

export interface IUseGA {
    GATracker: React.FC
}

const GATracker: React.FC = () => {
    const { environment, gaTrackingId } = useConfig();
    const location = useLocation();
    const [initialized, setInitialized] = useState(false);


    useEffect(() => {
        if (initialized) {
            ReactGA.pageview(location.pathname + location.search);
            if (environment === Environment.development) console.log(ReactGA.testModeAPI)
        } else if (gaTrackingId) {
            ReactGA.initialize(gaTrackingId, {testMode: environment === Environment.development});
            setInitialized(true);
        }
    }, [initialized, location]);


    return (
        <></>
    );
}

const useGA = (): IUseGA => {

    return {
        GATracker
    }
}



export default useGA;