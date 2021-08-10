// Node imports
import React, { FunctionComponent, useState } from "react";

// SCSS imports
import './SliderBttn.scss';

interface SliderBttnProperties {
    onActivate: () => void,
    onDeactivate: () => void,
    label: string,
    defaultValue: boolean,
}

const SliderBttn: FunctionComponent<SliderBttnProperties> = ({defaultValue, label, onActivate, onDeactivate} : SliderBttnProperties) => {
    
    const [ isActive, setIsActive ] = useState<boolean>(defaultValue);

    const toggleActivation = () => {
        if(isActive) {
            setIsActive(false);
            onDeactivate();
        } else {
            setIsActive(true);
            onActivate();
        }
    }

    return (
        <div className="slider-bbtn-container">
            <p className="slider-bttn__text">{label}</p>
            <div className="slider-bttn" onClick={toggleActivation}>
                <div className={`slider-bttn__active-bg ${(isActive) ? 'slider-bttn__active-bg--active' : null}`}>
                    <div className="slider-bttn__active-bg-circle"></div>
                </div>
            </div>
        </div>
    );
}

export default SliderBttn;