// Class imports
import Simulation from "../Simulation";

// Type imports
import { IPositionInUnits } from "../d.types";

export default class CameraControls {
    private simulation: Simulation;

    constructor ( simulation: Simulation ) {
        this.simulation = simulation;
    }

    /**
     * Move the camera to a geodetic position
     * @param lon lon of camera position
     * @param lat lat of camera position
     * @param hInUnits height in units (default 0.5)
     */
    public moveCameraToGeodeticCoords = ( lon: number, lat: number, hInUnits = 0.5): void => {
        const h = this.simulation.context.unitsToMeters(hInUnits);
        const positionInUnits: IPositionInUnits = this.simulation.context.geodeticPosToUnitPos({lon, lat, h});

        this.simulation.context.camera.position.x = positionInUnits.x;
        this.simulation.context.camera.position.y = positionInUnits.y;
        this.simulation.context.camera.position.z = positionInUnits.z;
        this.simulation.context.orbitControls.update();
    }


    // SHOULD BE REPLACED
    public selectDateAndTime = ( date: Date, timeInS: number ): Promise<void> => {
        return this.simulation.initSim(date, timeInS)
    }
}