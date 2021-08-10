// Node imports
import React, { FunctionComponent, Fragment,  useState, useEffect } from "react";
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { toLonLat } from 'ol/proj';

// Class imports
import CameraControls from "../../../Engine/Controls/CameraControls";
import TimeControls from "../../../Engine/Controls/TimeControls";

// Component imports 
import { ButtonPrim } from '../../../../../components';

// Asset imports
import icon from '../../../assets/icons/location-icon.svg';
import editIcon from '../../../../../assets/icons/edit-icon.svg';
import closeIcon from '../../../../../assets/icons/cancel-icon.svg';

// SCSS imports
import './MeteorAtLocationUI.scss';

interface CamsTabProperties {
    // control: CamsTabControls
    isVisible: boolean,
    camera: CameraControls,
    time: TimeControls,
    toggleVisibility: () => void,
    onSelect: (iauCode: string) => void,
}

interface IFetchedShowerAtLocation {
    activityEnd: string,
    activityStart: string,
    count: number,
    name: string,
    windDir: string,
    meanLon: number,
    meanLat: number,
    bestRecordedDate: string,
    bestDateFirstMeteorTime: string,
    iauCode: string
}

interface IShowerAtLocation {
    activityEnd: string,
    activityStart: string,
    count: number,
    name: string,
    windDir: string,
    meanLon: number,
    meanLat: number,
    bestRecordedDate: string,
    bestDateFirstMeteorTime: number,
    iauCode: string
}

const MeteorAtLocationUI: FunctionComponent<CamsTabProperties> = ({isVisible, toggleVisibility, camera, time, onSelect} : CamsTabProperties) => {
    const baseUrl = process.env.REACT_APP_API_BASE;

    const [ mapIsVisible, setMapIsVisible ] = useState<boolean>(false); 
    const [ selectedCoordinates, setSelectedCoordinates ] = useState<{ lon: number, lat: number} | undefined>();
    const [ address, setAdress ] = useState<string | undefined>();
    const [ showers, setShowers ] = useState<IShowerAtLocation[] | undefined>();

    /**
     * When map is visible => create map
     */
    useEffect(() => {
        if ( mapIsVisible ) {
            // Create map
            const map = new Map({
                layers: [
                  new TileLayer({
                    source: new XYZ({
                    //   attributions: attributions,
                      url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + process.env.REACT_APP_MAPTILER_KEY,
                      tileSize: 512,
                    }),
                  }) ],
                // overlays: [overlay],
                target: 'map',
                view: new View({
                  center: [0, 0],
                  zoom: 0,
                }),
              });
            
            // Eventlistener
            map.on('singleclick', function (evt) {
                const coordinate = evt.coordinate;
                const lonlat = toLonLat(coordinate);
                setSelectedCoordinates({lon: lonlat[0], lat: lonlat[1]});
                setMapIsVisible(false);
                time.toggleRunning(false);
            });
        }
    }, [mapIsVisible]);

    /**
     * When coordinates are selected fetch showers
     */
    useEffect(() => {
        const getShowers = async () => {
            if (selectedCoordinates) {
                // remove existing showers
                setShowers(undefined);

                // fetch showers
                const showersRes: { showers: IFetchedShowerAtLocation[] } = await fetch(baseUrl + 'meteors-at-location?lon=' + selectedCoordinates.lon.toString() + '&lat=' + selectedCoordinates.lat)
                    .then((res) => res.json());
                if (showersRes.showers) {
                    const showersResReformatted: IShowerAtLocation[] = showersRes.showers.map((shower) => {
                        const formattedShower = shower as unknown as IShowerAtLocation;
                        formattedShower.count = Number(shower.count);
                        formattedShower.meanLat = Number(shower.meanLat);
                        formattedShower.meanLon = Number(shower.meanLon);

                        // convert time from HMS to seconds
                        const splittedTimeString = shower.bestDateFirstMeteorTime.split(':')
                        formattedShower.bestDateFirstMeteorTime = Number(splittedTimeString[0])*60*60 + Number(splittedTimeString[1])*60 + Number(splittedTimeString[2]);

                        return formattedShower;
                    });
    
                    setShowers(showersResReformatted);
                    camera.moveCameraToGeodeticCoords(selectedCoordinates.lon, selectedCoordinates.lat);
                }
            }
        }

        const geoCode = async () => {
            if (selectedCoordinates) {
                const geocodeResult = await fetch('https://api.maptiler.com/geocoding/'+selectedCoordinates.lon+','+selectedCoordinates.lat+'.json?key='+process.env.REACT_APP_MAPTILER_KEY)
                    .then((res) => res.json());
                if (geocodeResult.features[0]) {
                    setAdress(geocodeResult.features[0].place_name);
                } else {
                    setAdress('lon: ' + selectedCoordinates.lon.toFixed(4)+', lat: '+selectedCoordinates.lat.toFixed(4));
                }
            }
        }

        getShowers();
        geoCode();
    }, [selectedCoordinates]);


    /**
     * Render shower options
     */
    const renderShowers = () => {
        if (showers) {
            // If no showers array is empty
            if (showers.length === 0) return (<p className="no-shower-msg">No meteor showers were recorded at your location yet.</p>)

            // return elements
            return showers.map((shower, index) => {
                return (
                    <div className="shower-option" key={"shower-"+index}>
                        <div className="shower-option-sub-container">
                            <p>{shower.name}</p>
                            <p>{shower.windDir}</p>
                        </div>
                        <div className="shower-option-sub-container shower-option-sub-container--small">
                            {
                                (shower.activityStart !== '*' && shower.activityEnd !== '*')
                                ? <p>{shower.activityStart} - {shower.activityEnd}</p>
                                : <p>Unknown activity</p>
                            }
                            <p 
                                className="shower-option-cta"
                                onClick={() => {
                                    camera.selectDateAndTime(new Date(shower.bestRecordedDate), shower.bestDateFirstMeteorTime)
                                        .then(() => {
                                            if(selectedCoordinates) camera.moveCameraToGeodeticCoords(selectedCoordinates.lon, selectedCoordinates.lat);
                                        }).then(() => {
                                            onSelect(shower.iauCode);
                                        });
                                }}
                            >View peak at {shower.bestRecordedDate.split(' ')[2]} {shower.bestRecordedDate.split(' ')[1]}</p>
                        </div>
                    </div>
                );
            });
        } else {
            const newEl = (key:number) => { return (
                <div className="shower-option--loading" key={key}>
                    <div className="shower-option-sub-container">
                        <p></p>
                        <p></p>
                    </div>
                    <div className="shower-option-sub-container shower-option-sub-container--small">
                        <p></p>
                        <p className="shower-option-cta"></p>
                    </div>
                </div>
                )};
            return [ newEl(0),newEl(1),newEl(2),newEl(3),newEl(4),newEl(5),newEl(6),newEl(7) ]
        }
        

        
    }

    return(
        <Fragment>
            
        <div 
            className={`meteors-at-location-tab noselect ${(!isVisible) ? 'meteors-at-location-tab--hidden' : null}`}
            onClick={() => {
                if (!isVisible) {
                    toggleVisibility();
                }
            }}
        >
            <p className="tab-label">Pick a location</p>
            <div 
                className="meteors-at-location-tab__header"
            >
                { 
                    (isVisible) 
                    ? <p>
                        { 
                            (address) ? address : 'Select a location' 
                        }
                        { 
                            (address) 
                            ? 
                            <img 
                                src={editIcon}
                                onClick={() => setMapIsVisible(true)}
                            /> : null
                        }
                        </p>
                    : null
                }

                <img 
                    className="tab-icon" 
                    src={icon}
                    onClick={() => {toggleVisibility()}}
                />
            
               
            </div>
            {
                // List of showers
                (isVisible)
                ? <div className="meteors-at-location-tab__body">
                    {
                        (selectedCoordinates)
                        ?<div className="shower-list-container">
                            <p className="shower-list-container-title">Visible meteor showers at selected location:</p>
                            { renderShowers() }
                        </div>
                            :<Fragment>
                                <p 
                                    className="meteors-at-location-tab-intro"
                                    onClick={() => setMapIsVisible(true)}
                                >Select a location to see which showers are visible at your location.</p>
                                <ButtonPrim text="Select location" onClick={() => setMapIsVisible(true)}/>
                            </Fragment> 
                        }
                </div>
                : null
            }

            {
                // About
                (isVisible)
                ? <div className="showers-about">
                    <a href="/about-meteors#meteor-showers" target="_blank">What are meteor showers?</a>
                </div>
                : null
            }
        </div>
        
        {
            (mapIsVisible)
            ?<div className="location-popup-container">
                <div className="location-popup">
                    <img className="location-popup__close" src={closeIcon} onClick={() => setMapIsVisible(false)} />
                    <p>Click on the map to select a location</p>
                    <div id="map" className="map"></div>
                </div>
            </div>
            : null
        }
        </Fragment>
    );
}

export default MeteorAtLocationUI;