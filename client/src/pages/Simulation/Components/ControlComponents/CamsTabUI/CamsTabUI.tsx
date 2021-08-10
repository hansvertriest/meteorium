// Node imports
import React, { FunctionComponent, useState } from "react";

// Class imports
import MeteorControls from "../../../Engine/Controls/MeteorControls";
import CameraControls from "../../../Engine/Controls/CameraControls";
import TimeControls from "../../../Engine/Controls/TimeControls";

// SCSS imports
import './CamsTabUI.scss';

interface CamsTabProperties {
    meteorControl: MeteorControls,
    camera: CameraControls,
    time: TimeControls,
    isVisible: boolean,
    toggleVisibility: () => void,
    toggleFpMode: (value: boolean) => void,
}

const CamsTabUI: FunctionComponent<CamsTabProperties> = ({isVisible, toggleVisibility, meteorControl, camera, time, toggleFpMode} : CamsTabProperties) => {
    const networks: {[index: string]: {color: string, netwNr: number}} = {
        'CAMS California': {color: '#FFE710', netwNr: 1},
        'CAMS Florida': { color: '#E36060', netwNr: 2},
        'CAMS BeNeLux': { color: '#3F88F4', netwNr: 3},
        'CAMS Mid Atlantic': { color: '#87FF10', netwNr: 4},
        'CAMS New Zealand': { color: '#FFAE10', netwNr: 5},
        'Lowell Observatory CAMS, Arizona': { color: '#10FFF1', netwNr: 6},
        'UAE Astronomical Camera Network': { color: '#FF10D9', netwNr: 7}
    };

    const [ isHighlighted, setIsHighlighted ] = useState<boolean>(false);

    const renderNetworks = () => {
        // Calculate star info 
        const networksWithInfo: {[index: string]: {
            color: string,
            netwNr: number,
            meteorPresent: boolean,
            lon: number,
            lat: number,
            time: number}
        } = {};
        Object.keys(networks).forEach((networkTitle) => {
            const netwInfo = meteorControl.findTimeOfFirstMeteorsRecordedInNetwork(networks[networkTitle].netwNr);
            networksWithInfo[networkTitle] = {...networks[networkTitle], ...netwInfo};
        });

        // Render elements
        const squareWidth = 15;
        return Object.keys(networksWithInfo).map((networkTitle, index) => {
            return (
                <div
                    key={index}
                    className={`network ${(networksWithInfo[networkTitle].meteorPresent) ? 'network--hover' : 'network--none'}`}
                    onClick={() => showNetwork(networksWithInfo[networkTitle].netwNr)}
                >
                    <p>{networkTitle}</p>
                    <div className="network-color" 
                        style={{
                            backgroundColor: networksWithInfo[networkTitle].color,
                            width: squareWidth+'px',
                            height: squareWidth+'px'
                        }}
                    ></div>
                    
                </div>
            );
        });
    }

    const toggleHighlight = (e: React.ChangeEvent<HTMLElement>): void => {
        const el = e.currentTarget as HTMLInputElement;
        setIsHighlighted(el.checked);
        if (el.checked) {
            meteorControl.highlightPerNetwork();
        } else {
            meteorControl.removeAllHighlight();
        }
    }

    const checkForMobile = (): boolean => {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
        return check;
      };

    const showNetwork = ( network: number ): void => {
        const netwInfo = meteorControl.findTimeOfFirstMeteorsRecordedInNetwork(network);
        if (netwInfo.meteorPresent) {
            if (checkForMobile()) {
                time.selectDate(time.getSelectedDate(), 15000, {lon: netwInfo.lon, lat: netwInfo.lat}, undefined, true, true);
                toggleVisibility();
                toggleFpMode(true);
            } else {
                camera.moveCameraToGeodeticCoords(netwInfo.lon, netwInfo.lat);
                // time.setTime(netwInfo.time); 
                time.toggleRunning(false);
            }
        }
    }

    return(
        <div 
            className={`cams-tab noselect ${(!isVisible) ? 'cams-tab--hidden' : null}`}
            onClick={() => {
                if (!isVisible) {
                    toggleVisibility();
                }
            }}
        >
            <div 
                className="cams-tab__header"
                onClick={ toggleVisibility }
            >
                <p>CAMS</p>
            </div>
            <p className="tab-label">CAMS networks</p>
            {
                (isVisible)
                ? <div className="cams-tab__body">
                    <div>
                        <label className="highlight-checkbox">
                            Highlight all networks
                            <input type="checkbox" onChange={toggleHighlight} checked={isHighlighted} />
                        </label>
                    </div>
                    <p className="cams-info">
                        All meteor data shown in this simulation has been recorded by camera’s around the world. Each region has it’s own camera-network:
                    </p>
                    <div className="networks-container">
                        { renderNetworks() }
                    </div>
                    <div className="cams-about">
                        <a href="/about-cams" target="_blank">What is the CAMS-project?</a>
                    </div>
                </div>
                : null
            }
        </div>
    );
}

export default CamsTabUI;