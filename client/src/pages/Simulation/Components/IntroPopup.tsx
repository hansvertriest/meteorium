// Node imports
import React, { FunctionComponent, Fragment } from "react";

// Component imports 
import { 
    Logo,
    ButtonPrim,
    LoadingAnimation
} from '../../../components';

//Type import
import {
    IOnSimLoadStartEvent,
} from '../Engine/d.types';

// SCSS imports
import './IntroPopup.scss';


interface IIntroPopup {
    loadingContent: IOnSimLoadStartEvent | undefined,
    simIsReady: boolean,
    onClose: () => void
}

const IntroPopup: FunctionComponent<IIntroPopup> = ({ loadingContent, simIsReady, onClose } : IIntroPopup) => {

    return(
        <div className="intro-popup-container">
            <div className="intro-popup">
                <Logo type="vertical" />
                <p>Welcome to the Meteorium! </p>
                <p>Meteorium is an interactive simulation of the shooting stars visible in our night-sky. By using the tools on the left of the screen you’ll be able to track down past shooting stars and meteor showers at any given position and time between 2010 and 2016.</p>
                <p>This visualisation is created using publicly available data from the <a href="/about-cams">CAMS-project</a> at NASA. If you want to learn about what shooting stars and meteors have to do with eachother, you can do so <a href="/about-meteors">here</a>!</p>
                <div className="intro-popup__loading">
                    {
                        (loadingContent)
                        ?<Fragment>
                            <p>{loadingContent.date.toString().split(' ')[0]} {loadingContent.date.toString().split(' ')[2]} {loadingContent.date.toString().split(' ')[1]}, {loadingContent.date.toString().split(' ')[3]} | {loadingContent.timeInHM}</p>
                            <p>lon: {loadingContent.position.lon}°, lat: {loadingContent.position.lat}°</p>
                            {(simIsReady) ? <p>Simulation is ready!</p> : <Fragment><p>Loading...</p><LoadingAnimation width={15} /></Fragment>}
                        </Fragment>
                        : <LoadingAnimation width={15} />
                    }
                </div> 

                {
                    (simIsReady)
                    ? <ButtonPrim text="Proceed to the meteorium" onClick={onClose}/>
                    : null
                }
                        
            </div>
        </div>
    );
}

export default IntroPopup;