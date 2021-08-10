// Node imports
import React, { FunctionComponent, useEffect, useState } from "react";
import * as d3 from 'd3';

// Component imports
import {
    SliderBttn
} from '../../../../../components';

// Class imports
import TimeControls from "../../../Engine/Controls/TimeControls";
import SimulationControls from "../../../Engine/Controls/SimulationControls";
import CameraControls from "../../../Engine/Controls/CameraControls";

// Type imports
import { IOnTimeChangeEvent } from "../../../Engine/d.types";

// SCSS imports
import './TimeControlUI.scss';

// Asset imports
import playBtn from '../../../assets/icons/play-solid.svg'
import pauseBtn from '../../../assets/icons/pause-icon.svg'
import editIcon from '../../../../../assets/icons/edit-icon.svg'

interface TimeControlUIProps {
    control: TimeControls,
    simulation: SimulationControls,
    camera: CameraControls
    onOpenDatePicker: () => void,
}

const TimeControlUI: FunctionComponent<TimeControlUIProps> = ( { control, simulation, camera, onOpenDatePicker}: TimeControlUIProps ) => {

    const colors = ['#000000','#FFE710', '#E36060', '#3F88F4', '#87FF10', '#FFAE10'];
    const coordinates: {lon:number,lat:number}[] = [
        {lat:38.272689,lon:-101.075745},
        {lat:49.267805,lon:13.843135},
        {lat:-41.902277,lon:171.891840},
        {lat:48.690960,lon:-53.959093},
        {lat:33.137551,lon:46.551965},
    ];

    const [ mouseDownInitPosX, setMouseDownInitPosX ] = useState<number>(0);
    const [ isDragging, setIsDragging ] = useState<boolean>(false);
    const [ speed, setSpeed ] = useState<number>(500);
    const [ isPlaying, setIsPlaying ] = useState<boolean>(true);
    const [ staticModeIsEnabled, setStaticModeIsEnabled ] = useState<boolean>(false);

    const [ addedEventListeners, setAddedEventListeners ] = useState<boolean>(false);

    useEffect(() => {
        if(!addedEventListeners) {
            control.addOnTimeChangedEventListener((e: IOnTimeChangeEvent) => { 
                updateTimeIndicator(e.simTimeInHM,  e.simTimeInPercentage);
            });
    
            control.addOnDataLoadedEventListener(() => { 
                createGraphs();
            });
    
            control.addOnSimPauseEventListeners(() => {
                setIsPlaying(false);
            });
            control.addOnSimStartEventListeners(() => {
                setIsPlaying(true);
            });
    
            // General listener: when mouseup anywhere, dragging should be done
            window.addEventListener('mouseup', () => {
                setIsDragging(false)
            });

            setAddedEventListeners(true)
        }
    });

    useEffect(() => {
        if (staticModeIsEnabled) {
            simulation.disableSun();
            // set progress to full
            const indicator = document.getElementById('time-indicator');
            if(indicator) indicator.style.width = '100%';
        } else {
            simulation.enableSun(); 
        }
    }, [staticModeIsEnabled]);

    useEffect(() => {
        control.setSpeed(speed);
    }, [speed]);

    const createGraphs = (): void => {
        // first remove previously existing graphs
        d3.select('svg').remove();

        const timeLineElement = document.getElementById('timeline');
        const margin = {top: 10, side: 3};
        const width = (timeLineElement) ? timeLineElement.offsetWidth - margin.side*2: 800;
        const height = (timeLineElement) ? timeLineElement.offsetHeight - margin.top*2: 100;

        const intervalInS = 1800;
        const data = control.getFrequencyOfMeteorsPerContinent(intervalInS);

        let maxFreq = 0;
        // get maximun frequency
        data.forEach((continentData) => {
            const continentMaxFreq = Math.max(...continentData.frequencies.map((freq) => freq.value));
            if (maxFreq < continentMaxFreq) maxFreq = continentMaxFreq;
        });

        // Create SVG
        const svg = d3.select("#timeline")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("viewBox", `0 0 ${width} ${height}`)
                .attr("transform",
                    "translate(" + margin.side + "," + margin.top + ")");
        
        // Eventlistener to scale graph on resize
        window.addEventListener('resize', () => {
            const width = (timeLineElement) ? timeLineElement.offsetWidth - margin.side*2: 800;
            svg.attr("width", width);
        });
        
        // Add x-axis
        const x = d3.scaleLinear()
            .domain([0, 86400-intervalInS])
            .range([0, width])
        // svg.append("g")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain( [0, maxFreq+5])
            .range([ height, 0 ]);
        // svg.append("g")
        //     .call(d3.axisLeft(y));

        data.forEach((continentData, index) => {
            // Will generate data for a line
            const lineGenerator = d3.line<{ name: number, value: number }>()
                .x((d) => { return x(d.name) })
                .y((d) => { return y(d.value) })
                .curve(d3.curveCardinal);

            // Add line to graph
            svg.append("path")
                .datum(continentData.frequencies)
                .attr("fill", "none")
                .attr("stroke", colors[index])
                .attr("stroke-width", 1.5)
                .attr("d", lineGenerator)
                .attr("stroke-width", 3)
                // // On hover event
                // .on("mouseover", () => {
                //     setHoveredContinent(continentData.continent)
                // })
                // // On hover leave
                // .on("mouseout", () => {
                //     setHoveredContinent('Hover over a graph')
                // })
        });

        // set responsive graphs
        window.addEventListener('resize', () => {
            const timeLineElement = document.getElementById('timeline');
            const width = (timeLineElement) ? timeLineElement.offsetWidth - margin.side*2: 800;
            const height = (timeLineElement) ? timeLineElement.offsetHeight - margin.top*2: 100;
            svg
                .attr("width", width)
                .attr("height", height)
        })
    }

    /**
     * Updates the time-indicator and timestamp on the timeline
     * @param simTimeInHM time in hours and minutes
     * @param simTimeInPercentage time in %
     */
    const updateTimeIndicator = (simTimeInHM: string, simTimeInPercentage: number ): void => {
        // sanitize inputs
        if(simTimeInPercentage > 1) simTimeInPercentage = 1;
        if(simTimeInPercentage < 0) simTimeInPercentage = 0;

        const indicator = document.getElementById('time-indicator');
        const text = document.getElementById('time-in-hms');
        if(text) text.innerHTML = simTimeInHM+'<span>UTC</span>';
        if(indicator) indicator.style.width = simTimeInPercentage*100 + '%';
    }

    /**
     * Returns the percentage of the mouse relative to the timeline
     * @param e MouseEvent
     */
    const getPercentageOfTimeIndicator = ( e: React.MouseEvent<HTMLElement> ): number | undefined => {
        const xCoord = e.nativeEvent.offsetX;
        const timeLineElement = document.getElementById("timeline");
        if (timeLineElement) {
            const fullWidth = timeLineElement.offsetWidth;
            return xCoord/ fullWidth
        }
        return undefined;
    }

    /**
     * Selects the time of the current position of the mouse relative to the timeline
     * @param e MouseEvent
     */
    const selectTime = ( e: React.MouseEvent<HTMLElement> ): void => {
        setIsDragging(false)

        // Set simTime
        const percentage = getPercentageOfTimeIndicator(e);
        if(percentage !== undefined) {
            control.setSimulationProgressInPercentage(percentage)
        }
    }

    /**
     * Function fired whenever the mousemove-event is triggered on de timeline
     * @param e MouseEvent
     */
    const dragIndicator = (e: React.MouseEvent<HTMLElement>): void => {
        // set initial mousedown position
        setMouseDownInitPosX(mouseDownInitPosX + e.nativeEvent.movementX);

        if(isDragging) {
            // get percentage 
            let percentage = 0;
            const timeLineElement = document.getElementById("timeline");
            if (timeLineElement) {
                const fullWidth = timeLineElement.offsetWidth;
                percentage = mouseDownInitPosX/ fullWidth
            }

            if(percentage > 1) percentage = 1;
            if(percentage < 0) percentage = 0;
            control.setSimulationProgressInPercentage(percentage)
            control.updateClock();
        }
    }

    const togglePlay = (): void => {
        setIsPlaying(!isPlaying);
        control.toggleRunning();
    }

    return (
        <div className="time-control">
            <div className="time-control__control-container">

                {/* Left container */}

                <div className="time-control__control-container-left">
                    <p 
                        style={{visibility: (staticModeIsEnabled) ? 'hidden' : 'visible' }}
                        className="control-container-time" 
                        id="time-in-hms"
                    >00h00 <span>UTC</span></p>
                    <p className="control-container-date" onClick={onOpenDatePicker}>
                        {control.getSelectedDate().toString().split(' ')[0]} {control.getSelectedDate().toString().split(' ')[1]} {control.getSelectedDate().toString().split(' ')[2]}, {control.getSelectedDate().toString().split(' ')[3]}
                        <img src={editIcon} />
                        {/* {' '}({simulation.getAmountOfMeteors()} meteors) */}
                    </p>
                </div>


                {/* Middle container */}
                <div className="time-control__control-container-middle">
                    <div 
                        style={{visibility: (staticModeIsEnabled) ? 'hidden' : 'visible' }}
                        className="play-pause-skip-container"
                    >
                        <img id="play-btn" onClick={togglePlay} src={(isPlaying) ? pauseBtn : playBtn} />
                    </div>
                </div>
                
                {/* right container */}
                <div className="time-control__control-container-right">
                    <div 
                        style={{visibility: (staticModeIsEnabled) ? 'hidden' : 'visible' }}
                        className="speed-container"
                    >
                        <p className="speed-container__text">
                            Speed {speed}X 
                            {/* -  
                            <span>
                                {(control.getAvgMeteorsPerSecond(speed) > 1) ? ' ' + control.getAvgMeteorsPerSecond(speed).toFixed(0) : ' <1' } meteors/s
                            </span> */}
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
                        onActivate={() => setStaticModeIsEnabled(control.toggleStaticMode)}
                        onDeactivate={() => setStaticModeIsEnabled(control.toggleStaticMode)}
                    />
                </div>
            </div>
            
            <div className="time-control__timeline-container">
                <div className="timeline-top">
                    <p>Frequency of meteors in function of time per continent </p>
                    <p className="timeline-top__timespan" >Total timespan: 24h</p>
                </div>
                <div className="timeline" id="timeline" 
                    onClick={selectTime}
                    onMouseDown={(e) => { e.preventDefault(); setIsDragging(true); setMouseDownInitPosX(e.nativeEvent.offsetX);}}
                    onMouseMove={dragIndicator}
                    onMouseUp={selectTime}
                >
                    
                    <div id="time-indicator" className="time-indicator">
                        <div 
                            style={{visibility: (staticModeIsEnabled) ? 'hidden' : 'visible' }}
                            className="time-indicator__bar"
                        ></div>
                    </div>
                </div>
                <div className="legenda-entries">
                    <div className="legenda-entries__entry" onClick={() => {
                        camera.moveCameraToGeodeticCoords(coordinates[0].lon, coordinates[0].lat, 1)
                    }}>
                        <div style={{backgroundColor: colors[1]}}></div><p> North-America </p>
                    </div>
                    <div className="legenda-entries__entry" onClick={() => {
                        camera.moveCameraToGeodeticCoords(coordinates[1].lon, coordinates[1].lat, 1)
                    }}>
                        <div style={{backgroundColor: colors[2]}}></div><p> Europe </p>
                    </div>
                    <div className="legenda-entries__entry" onClick={() => {
                        camera.moveCameraToGeodeticCoords(coordinates[2].lon, coordinates[2].lat, 1)
                    }}>
                        <div style={{backgroundColor: colors[3]}}></div><p> Oceania </p>
                    </div>
                    <div className="legenda-entries__entry" onClick={() => {
                        camera.moveCameraToGeodeticCoords(coordinates[3].lon, coordinates[3].lat, 1)
                    }}>
                        <div style={{backgroundColor: colors[4]}}></div><p> Mid-Atlantic </p>
                    </div>
                    <div className="legenda-entries__entry" onClick={() => {
                        camera.moveCameraToGeodeticCoords(coordinates[4].lon, coordinates[4].lat, 1)
                    }}>
                        <div style={{backgroundColor: colors[5]}}></div><p> Middle-East </p>
                    </div>
                </div>
            </div>
            
        </div>
    );
}

export default TimeControlUI;