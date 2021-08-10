// Node imports
import React, { FunctionComponent, Fragment,  useState, useEffect } from "react";
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { toLonLat } from 'ol/proj';

// Class imports
import TimeControls from "../../../Engine/Controls/TimeControls";

// Component imports 
// import { ButtonPrim } from '../../../../../components';

// Asset imports
import icon from '../../../assets/icons/location-icon.svg';
// import editIcon from '../../../../../assets/icons/edit-icon.svg';
import closeIcon from '../../../../../assets/icons/cancel-icon.svg';

// SCSS imports
import './FirstPersonTabUI.scss';

interface FirstPersonProperties {
    time: TimeControls,
}


const FirstPersonTabUI: FunctionComponent<FirstPersonProperties> = ( { time } : FirstPersonProperties) => {

    const [ mapIsVisible, setMapIsVisible ] = useState<boolean>(false); 
    const [ selectedCoordinates, setSelectedCoordinates ] = useState<{ lon: number, lat: number} | undefined>();

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
            });
        }
    }, [mapIsVisible]);

    /**
     * When coordinates are selected fetch showers
     */
    useEffect(() => {
        if (selectedCoordinates) {
            time.selectDate(time.getSelectedDate(), 15000, {lon: selectedCoordinates.lon, lat: selectedCoordinates.lat}, undefined, true, true);
        }

    }, [selectedCoordinates]);



    return(
        <Fragment>
            
        <div 
            className="first-person-tab"
            onClick={() => {
                setMapIsVisible(true)
            }}
        >
                <img 
                    className="tab-icon" 
                    src={icon}
                    onClick={() => {setMapIsVisible(true)}}
                />
            
            
        </div>
        
        {
            (mapIsVisible)
            ?<div className="location-popup-container">
                <img className="location-popup__close" src={closeIcon} onClick={() => setMapIsVisible(false)} />
                <div className="location-popup">
                    <p>Click on the map to select a location</p>
                    <div id="map" className="map"></div>
                </div>
            </div>
            : null
        }
        </Fragment>
    );
}

export default FirstPersonTabUI;