// Node imports
import React, { FunctionComponent, useState, Fragment } from "react";

// Component imports 
import {
    TimeControlUI,
    DatePickerUI,
    CamsTabUI,
    MeteorAtLocationUI,
    ShowerInfoUI,
    ShareButtonUI,
    FpvControlTabUI,
    // FirstPersonTabUI,
} from '../Components/ControlComponents';

// Class imports
import TimeControls from '../Engine/Controls/TimeControls';
import MeteorControls from "../Engine/Controls/MeteorControls";
import CameraControls from "../Engine/Controls/CameraControls";
import SimulationControls from "../Engine/Controls/SimulationControls";

// SCSS imports
import './ControlsUI.scss';

interface IControlsUI {
    time: TimeControls,
    meteor: MeteorControls,
    camera: CameraControls,
    simulation: SimulationControls,
    selectedIauCode: string | undefined,
}

const ControlsUI: FunctionComponent<IControlsUI> = ({  time, meteor, camera, simulation, selectedIauCode  } : IControlsUI) => {
    // UI 
    const [ datePickerIsVisible, setDatePickerIsVisible ] = useState<boolean>(false);
    const [ camsTabIsVisible, setCamsTabIsVisible ] = useState<boolean>(false);
    const [ meteorsAtLocationTabIsVisible, setMeteorsAtLocationTabIsVisible ] = useState<boolean>(false);
    const [ showerInfoIsVisible, setShowerInfoIsVisible ] = useState<boolean>(false);
    const [ fpvControlIsVisible, setFpvControlIsVisible ] = useState<boolean>(false);
    const [ fpModeEnabled, setFpModeEnabled ] = useState<boolean>(false);

    // Cross component info
    const [ selectedIauShowerCode, setSelectedIauShowerCode ] = useState<string | undefined>(selectedIauCode);

    const closeAllTabsLeft = () => {
        setDatePickerIsVisible(false);
        setCamsTabIsVisible(false);
        setMeteorsAtLocationTabIsVisible(false);
    }

    return(
        <div className={`controls-ui`}  >
            
            <TimeControlUI 
                control={time}
                simulation={simulation}
                camera={camera}
                onOpenDatePicker={() => setDatePickerIsVisible(true)} 
            />


            {
                (fpModeEnabled)
                ? <div className="ui-layer__tabs-right">
                    <FpvControlTabUI 
                        time={time}
                        isVisible={fpvControlIsVisible}
                        toggleVisibility={(value?) => setFpvControlIsVisible((value) ? value : !fpvControlIsVisible)}
                        toggleFpMode={(value) => {
                            if (value) {
                                setFpModeEnabled(value);
                            } else {
                                setFpModeEnabled(!fpModeEnabled);
                            }

                        } }
                    />
                </div>
                :<Fragment>
                <div className="ui-layer__tabs-right">
                    <ShowerInfoUI 
                        selectedShowerIauCode={selectedIauShowerCode}
                        meteor={meteor}
                        simulation={simulation}
                        camera={camera}
                        time={time}
                        isVisible={showerInfoIsVisible}
                        toggleVisibility={(value?) => setShowerInfoIsVisible((value) ? value : !showerInfoIsVisible)}
                    />
                    <ShareButtonUI simulationControls={simulation}/>
                </div>

                <div className="ui-layer__tabs-left">
                    <DatePickerUI 
                        time={time} 
                        isVisible={datePickerIsVisible}
                        toggleVisibility={() => {closeAllTabsLeft(); setDatePickerIsVisible(!datePickerIsVisible)} }
                        onDateWithShowerSelect={(iauCode) => {
                            setSelectedIauShowerCode(undefined)
                            setSelectedIauShowerCode(iauCode)
                        }}
                    />
                    <MeteorAtLocationUI
                        isVisible={meteorsAtLocationTabIsVisible}
                        camera={camera}
                        time={time}
                        toggleVisibility={() => {closeAllTabsLeft(); setMeteorsAtLocationTabIsVisible(!meteorsAtLocationTabIsVisible)} }
                        onSelect={(iauCode: string) => {
                            setSelectedIauShowerCode(undefined)
                            setSelectedIauShowerCode(iauCode)
                        }}
                    />
                    <CamsTabUI
                        meteorControl={meteor} 
                        isVisible={camsTabIsVisible}
                        camera={camera}
                        time={time}
                        toggleVisibility={() => {closeAllTabsLeft(); setCamsTabIsVisible(!camsTabIsVisible)} }
                        toggleFpMode={(value) => {
                            if (value) {
                                setFpModeEnabled(value);
                            } else {
                                setFpModeEnabled(!fpModeEnabled);
                            }

                        } }
                    />
                </div>
                </Fragment>
            }
            
        </div>
    );
}

export default ControlsUI;