import React, { Fragment, FunctionComponent, useEffect, useState } from "react";

// Class imports
import SimulationControls from '../../../Engine/Controls/SimulationControls';

// import assets
import shareIcon from '../../../../../assets/icons/share-icon.svg';
import closeIcon from '../../../../../assets/icons/cancel-icon.svg';

// import styles
import './ShareButtonUI.scss'

// interfaces
interface IShareButtonPros {
    simulationControls: SimulationControls,
}


const ShareButtonUI: FunctionComponent<IShareButtonPros> = ({ simulationControls }: IShareButtonPros) => {
    
    const [ popupIsVisible, setPopupIsVisible ] = useState<boolean>(false);
    const [ generatedURL, setGeneratedURL ] = useState<string | undefined>();

    useEffect(() => {
        if (!generatedURL && popupIsVisible) {
            setGeneratedURL(simulationControls.getUrl());
        }
        if (!popupIsVisible) {
            setGeneratedURL(undefined)
        }
    }, [generatedURL, popupIsVisible]);


    return(
        <Fragment>
            <div className="share-button" onClick={() => setPopupIsVisible(true)}>
                <img src={shareIcon} />
            </div>
            {
                (popupIsVisible)
                ? <div className="share-button__popup">
                    <div className="share-button__popup-inner">
                    <img className="share-button__popup-inner-close" src={closeIcon} onClick={() => setPopupIsVisible(false)} />
                        <p>By sharing this url, anyone will be able to find this simulation at the current position and time</p>
                        {
                            (generatedURL)
                            ?<input type="text" defaultValue={generatedURL}/>
                            :<p>Creating url...</p>
                        }
                        
                    </div>
                </div>
                : null
            }
        </Fragment>
    );
};

export default ShareButtonUI;
