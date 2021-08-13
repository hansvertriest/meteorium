// Node imports
import React, { FunctionComponent, useRef, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

// Component imports 
import { 
    ControlsUI,
    IntroPopup,
} from './Components';

import {
    LoadingAnimation,
    Header
} from '../../components';

// Class imports
import Simulation from './Engine/Simulation';
import TimeControls from './Engine/Controls/TimeControls';
import MeteorControls from "./Engine/Controls/MeteorControls";
import CameraControls from "./Engine/Controls/CameraControls";
import SimulationControls from "./Engine/Controls/SimulationControls";

//Type import
import {
    IOnSimLoadStartEvent,
} from './Engine/d.types';

// SCSS imports
import './SimulationPage.scss';


const SimulationPage: FunctionComponent = () => {
    const canvasRef: React.RefObject<HTMLCanvasElement> = useRef<HTMLCanvasElement>(null);

    // Control objects
    const [ timeControls, setTimeControls ] = useState<TimeControls | undefined>();
    const [ meteorControls, setMeteorControls ] = useState<MeteorControls | undefined>();
    const [ cameraControls, setCameraControls ] = useState<CameraControls | undefined>();
    const [ simulationControls, setSimulationcontrols ] = useState<SimulationControls | undefined>();

    // Popups 
    const [ loadingPopupContent, setLoadingPopupContent ] = useState<IOnSimLoadStartEvent | undefined>();
    const [ introPopupIsVisible, setIntroPopupIsVisible ] = useState<boolean>(true);

    // Other
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const [ selectionParams ] = useState
        <{date: Date, time: number, lon: number, lat: number, iauCode: string | undefined}>
        ({
            date: new Date(params.get('date') as string || '2016-08-12'),
            time: Number(params.get('time') || '15000'),
            lon: Number(params.get('lon') || -118.243683),
            lat: Number(params.get('lat') || 34.052235),
            iauCode: params.get('iau') || undefined
        });
    const [ isLoading, setIsLoading ] = useState<boolean>(true);

    useEffect(() => {
        if ( canvasRef.current !== null ) {
            // Create simulation
            const simulation = new Simulation(
                canvasRef.current,
            );

            simulation.init(
                selectionParams.date,
                selectionParams.time,
                selectionParams.lon,
                selectionParams.lat
            );

            // Create SimulationControls
            const simulationControlsObject = new SimulationControls(simulation);
            setSimulationcontrols(simulationControlsObject);

            // Create TimeControls
            const timeControlsObject = new TimeControls(simulation);
            setTimeControls(timeControlsObject);

            // Create CamsTabControls
            const meteorControlsObject = new MeteorControls(simulation);
            setMeteorControls(meteorControlsObject);

            // Create CameraControls
            const cameraControlObject = new CameraControls(simulation);
            setCameraControls(cameraControlObject);

            // set event listener when sim has loaded
            simulation.onSimStartLoadListeners.push((e) => {
                setLoadingPopupContent(e);
                setIsLoading(true);
            });
            simulation.onSimLoadedListeners.push(() => setIsLoading(false));
        }
    }, []);

    return (
        <div className="simulation">

            <Header />
            <canvas ref={canvasRef}></canvas>
            
            {
                (timeControls && meteorControls && cameraControls && simulationControls)
                ? <ControlsUI 
                    time={timeControls}
                    meteor={meteorControls}
                    camera={cameraControls}
                    simulation={simulationControls}
                    selectedIauCode={'PER'}
                />
                : null
            }

            {
                (isLoading && loadingPopupContent)
                ? <div className="loading-popup-container">
                    <div className="loading-popup">
                        <p>{loadingPopupContent.date.toString().split(' ')[0]} {loadingPopupContent.date.toString().split(' ')[2]} {loadingPopupContent.date.toString().split(' ')[1]}, {loadingPopupContent.date.toString().split(' ')[3]} | {loadingPopupContent.timeInHM}</p>
                        <p>lon: {loadingPopupContent.position.lon}°, lat: {loadingPopupContent.position.lat}°</p>
                        <p>Loading...</p>
                        <LoadingAnimation width={15} />
                    </div>
                </div>
                : null
            }
            {
                (introPopupIsVisible)
                ? <IntroPopup 
                    loadingContent={loadingPopupContent}
                    simIsReady={!isLoading}
                    onClose={() => {
                        setIntroPopupIsVisible(false);
                        timeControls?.toggleRunning();
                    }}
                />
                : null
            }
        </div>
    );
}

export default SimulationPage;