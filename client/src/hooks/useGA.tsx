// Node imports
import React, { useEffect, useState } from 'react'
import ReactGA from 'react-ga';
import { useLocation } from 'react-router-dom';

// Hook imports
import { useConfig, Environment, useStore } from '../hooks';

// Component imports

import { CookieBanner } from '../components';

export interface IUseGA {
    GATracker: React.FC
}

const GATracker: React.FC = () => {
    const { environment, gaTrackingId } = useConfig();
    const location = useLocation();
    const { value: allowsCookie, set: setAllowsCookie } = useStore('allowsCookies')

    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (initialized) {
            ReactGA.pageview(location.pathname + location.search);
            if (environment === Environment.development) console.log(ReactGA.testModeAPI)
        } else if (gaTrackingId && allowsCookie) {
            ReactGA.initialize(gaTrackingId, {testMode: environment === Environment.development});
            setInitialized(true);
            console.log('GA init')
        }
    }, [initialized, location, allowsCookie]);

    if (!initialized && allowsCookie === undefined) {
        return (
            <CookieBanner onAllowCookie={() => setAllowsCookie(true)} onDisableCookie={() => setAllowsCookie(false)}/>
        );
    }

    return (<></>)
}

const useGA = (): IUseGA => {

    return {
        GATracker
    }
}



export default useGA;