// Node imporst
import React from 'react';

// Component imports
import { SliderBttn } from '..';

// scss import
import './CookieBanner.scss';

// asset import 
import CrossIcon from '../../assets/icons/cancel-icon.svg';

interface ICookieBanner {
    onAllowCookie: () => void,
    onDisableCookie: () => void,
}

const CookieBanner: React.FunctionComponent<ICookieBanner> = ({ onAllowCookie, onDisableCookie }: ICookieBanner) => {
    return (
        <div className="cookie-banner">
            <img src={CrossIcon} onClick={onDisableCookie}/>
            <p>This website uses Google Analytics (which uses cookies) in order to gain insights on how to optimize this tool for our end-users.</p>
            <SliderBttn 
                label="Enable cookies"
                defaultValue={false}
                onActivate={onAllowCookie}
                onDeactivate={onDisableCookie}
            />
        </div>
    );
}

export default CookieBanner;