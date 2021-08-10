// Node imports
import React, { Fragment, FunctionComponent, useEffect, useState } from "react";

// Hook imports
import { useApi } from '../../../../../services';

// Class imports
import MeteorControls from "../../../Engine/Controls/MeteorControls";
import SimulationControls from "../../../Engine/Controls/SimulationControls";
import CameraControls from "../../../Engine/Controls/CameraControls";
import TimeControls from "../../../Engine/Controls/TimeControls";

// Import types
import {
    IShowerInfo
} from '../../../Engine/d.types';

// Asset imports
import chevron from '../../../assets/icons/chevron-icon.svg';
import showerIcon from '../../../assets/icons/shower-icon.svg';

// SCSS imports
import './ShowerInfoUI.scss';

interface IShowerInfoUI {
    selectedShowerIauCode: string | undefined,
    meteor: MeteorControls
    simulation: SimulationControls,
    isVisible: boolean,
    camera: CameraControls,
    time: TimeControls,
    toggleVisibility: (value?: boolean) => void,
}

const ShowerInfoUI: FunctionComponent<IShowerInfoUI> = ({ selectedShowerIauCode, meteor, simulation, camera, time, isVisible, toggleVisibility } : IShowerInfoUI) => {
    const { getShowerInfo } = useApi();

    // States of selectedShower
    const [ selectedIauCode, setSelectedIauCode ] = useState<string | undefined>(selectedShowerIauCode);
    const [ selectedShower, setSelectedShower ] = useState<IShowerInfo | undefined>();
    const [ isHighlighted, setIsHighlighted ] = useState<boolean>(false);
    const [ hoveredShowerName, setHoveredShowerName ] = useState<string | undefined>();
    // AvailableShower state
    const [ availableShowerNameAndIauCodes, setAvailableShowerNameAndIauCodes ] = useState<{iauCode: string, name: string, count: number}[]>([]);
    // Listener state
    const [ listenersAreSet, setListenersAreSet ] = useState<boolean>(false);
    // IsVisible state
    const [ showerListIsVisible, setShowerListIsVisible ] = useState<boolean>(false);

    useEffect(() => {
        if (selectedIauCode) {
            getInfo(selectedIauCode);
        }
    }, [selectedIauCode]);

    useEffect(() => {
        if (availableShowerNameAndIauCodes.length > 0 && !selectedIauCode) {
            const firstShower = availableShowerNameAndIauCodes[1];
            setSelectedIauCode( firstShower.iauCode );
        }
    }, [availableShowerNameAndIauCodes]);

    useEffect(() => {
        if (isHighlighted && selectedIauCode) {
            meteor.highlightPerShower(selectedIauCode);
        } else {
            meteor.removeAllHighlight();
        }
        // Force isHighligted to be true if 
        if (isVisible) setIsHighlighted(true)
    }, [isHighlighted, selectedIauCode]);

    useEffect(() => {
        // set onMeteorHover eventlistener
        if ( !listenersAreSet ) {
            // When simulation is loaded => getAvailableShowerNameAndIauCodes()
            simulation.addOnSimLoadedEventListener(() => {
                setAvailableShowerNameAndIauCodes(meteor.getAvailableShowerNameAndIauCodes()); 
            });
            // MeteorHoverListeners
            meteor.addMeteorHoverListener((data) => {
                setHoveredShowerName(data.showerIauCode);
                meteor.highlightPerShower(data.showerIauCode);
            });

            // MeteorHoverOut eventlisteners
            meteor.addMeteorHoverOutListener(() => {
                setHoveredShowerName(undefined);
                meteor.removeAllHighlight();
                // delete highlght highlight of selected shower
                setIsHighlighted(false);
            });

            // MeteorClick eventListeners
            meteor.addMeteorClickOutListener((data) => {
                toggleVisibility(true);
                setSelectedIauCode(data.showerIauCode);
            });

            setListenersAreSet(true);
        }
    });

    /**
     * Fetches the info from a given shower
     * @param code iau-code of shower
     */
    const getInfo = async ( code: string ) => {
        // Only fetch info when if there's no selectedShower or the new shower is differen from the selected one
        if (!selectedShower || selectedShower.iauCode !== code) {
            const info = await getShowerInfo(code);
            setSelectedShower(info);
        }
    }

    /**
     * Render items of the shower-select-list
     */
    const renderShowerListItems = () => {
        return availableShowerNameAndIauCodes.map((showerNameAndIauCode, index) => {
            return (
                <div 
                    className="shower-select__list-item" 
                    key={'shower-list-item-'+index}
                    onClick={() => {
                        setSelectedIauCode(showerNameAndIauCode.iauCode);
                        // setSelectedShowerCount(showerNameAndIauCode.count);
                        setShowerListIsVisible(false);
                    }}
                >
                    <p>{showerNameAndIauCode.name}</p>
                    <p>{showerNameAndIauCode.count} <span>meteors</span></p>
                </div>
            )
        });
    }

    /**
     * Transport camera and time to first appearance of selected meteor
     */
    const viewShowerInSimulation = (): void => {
        if (selectedIauCode) {
            const firstAppearance = meteor.findTimeOfFirstMeteorsRecordedInShower(selectedIauCode);
            camera.moveCameraToGeodeticCoords(firstAppearance.lon, firstAppearance.lat);
            time.setTime(firstAppearance.time);
            time.toggleRunning(false);
        }
    }

    return(
        <div 
            className={`shower-info ${(!isVisible) ? 'shower-info--hidden' : null}`}
            onClick={() => {
                if (!isVisible) {
                    toggleVisibility();
                    setIsHighlighted(!isHighlighted);
                }
            }}
        >
            <p className="tab-label">Shower info</p>
            {
                (hoveredShowerName)
                ? <div className="hover-popup">
                    <p>{hoveredShowerName}</p>
                </div>
                : null
            }

            <div className="shower-info__icon">
                <img 
                    className="" 
                    src={showerIcon}
                    onClick={() => {
                        toggleVisibility();
                        setIsHighlighted(!isHighlighted);
                    }}
                />
            </div>

            {
                (isVisible)
                ?<Fragment>

                    <div className="shower-info__header">
                        <p className="shower-info__header-label">Meteor showers at {time.getSelectedDate().toString().split(' ')[0]} {time.getSelectedDate().toString().split(' ')[1]} {time.getSelectedDate().toString().split(' ')[2]}, {time.getSelectedDate().toString().split(' ')[3]}:</p>
                        <div className={`shower-select ${(showerListIsVisible) ? 'shower-select--active': null } `}>
                            <p onClick={() => setShowerListIsVisible(!showerListIsVisible)}>
                                {selectedShower?.name}
                                <img src={chevron} />
                            </p>
                            {
                                (availableShowerNameAndIauCodes && showerListIsVisible)
                                ?
                                <div className="shower-select__list">
                                    { renderShowerListItems() }
                                </div>
                                : null
                            }
                        </div>
                    </div>
                    {
                        (selectedShower)
                        ? <div className="shower-info__body">
                            <p 
                                className="shower-info__body-view"
                            ><span onClick={viewShowerInSimulation} >View in simulation</span> (Highlighted in red)</p>

                            <p className="shower-info__body-title">About this shower</p>
                            
                            <div className="shower-info__body-info-container">
                                <p className="info-container__label">Geocentric speed</p>
                                <p className="info-container__value">{(typeof selectedShower.speed === 'number') ? selectedShower.speed*360 : 'unknown'} km/h</p>
                            </div>
                            <div className="shower-info__body-info-container">
                                <p className="info-container__label">Avtivity</p>
                                <p className="info-container__value">{(selectedShower.start !== '*' && selectedShower.end !== '*') ? `${selectedShower.start} - ${selectedShower.end}` : 'unknown'}</p>
                            </div>
                            <div className="shower-info__body-info-container">
                                <p className="info-container__label">Yearly peak</p>
                                <p className="info-container__value">{(selectedShower.peak !== '*') ? selectedShower.peak : 'unknown'}</p>
                            </div>
                            <div className="shower-info__body-info-container">
                                <p className="info-container__label">Origin parent</p>
                                <p className="info-container__value">{(selectedShower.parent !== '*') ? selectedShower.parent : 'unknown'}</p>
                            </div>
                            <a
                                className="shower-info__body-cta"
                                href="/about-meteors#meteor-showers"
                                target="_blank"
                                // onClick={() => history.push('/about-meteors')}
                            >What are meteor showers?</a>
                        </div>
                        : <p>Loading...</p>
                    }
                </Fragment>
                : null
            }
        </div>
    );
}

export default ShowerInfoUI;