// Node imports
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";

// Component imports
import {
    SliderBttn
} from '../../../../../components';

// Class imports
import TimeControls from "../../../Engine/Controls/TimeControls";

// Asset imports
import showerIcon from '../../../assets/icons/settings-icon.svg';

// SCSS imports
import './FpvControlTabUI.scss';

interface IFpvControlTab {
    isVisible: boolean,
    time: TimeControls,
    toggleVisibility: (value?: boolean) => void,
    toggleFpMode: (value?: boolean) => void,
}

const FpvControlTabUI: FunctionComponent<IFpvControlTab> = ({ time, isVisible, toggleVisibility, toggleFpMode } : IFpvControlTab) => {


    const [ staticModeIsEnabled, setStaticModeIsEnabled ] = useState<boolean>(false);
    const [ speed, setSpeed ] = useState<number>(500);

    useEffect(() => {
        time.setSpeed(speed);
    }, [speed]);

    const leaveFpMode = ():void => {
        time.selectDate(time.getSelectedDate(), undefined, undefined, undefined, false, true);
        toggleFpMode()
    }

    return(
        <div 
            className={`fpv-control ${(!isVisible) ? 'fpv-control--hidden' : null}`}
            onClick={() => {
                if (!isVisible) {
                    toggleVisibility();
                }
            }}
        >

            <div className="fpv-control__icon">
                <img 
                    className="" 
                    src={showerIcon}
                    onClick={() => {
                        toggleVisibility();
                    }}
                />
            </div>

            {
                (isVisible)
                ?<Fragment>

                    <div className="fpv-control__header">
                    </div>
                    <div 
                        style={{visibility: (staticModeIsEnabled) ? 'hidden' : 'visible' }}
                        className="speed-container"
                    >
                        <p className="speed-container__text">
                            Speed {speed}X 
                        </p>
                        <input 
                            type="range" 
                            min="1" 
                            max="10000" 
                            value={speed} 
                            className="speed-container__slider" 
                            id="speed-slider"
                            onChange={(e) => {
                                setSpeed(Number(e.target.value));
                            }}
                        />
                    </div>
                    <SliderBttn 
                        label={(staticModeIsEnabled) ? 'Show all meteors at once' : 'Show all meteors at once'}
                        defaultValue={staticModeIsEnabled}
                        onActivate={() => setStaticModeIsEnabled(time.toggleStaticMode)}
                        onDeactivate={() => setStaticModeIsEnabled(time.toggleStaticMode)}
                    />
                    <p className="fpv-control__leave" onClick={leaveFpMode}>Leave first-person view</p>
                    
                </Fragment>
                : null
            }
        </div>
    );
}

export default FpvControlTabUI;