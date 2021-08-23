// Helpers
import { captilizeFirstChar } from '../helpers/stringHelpers';

// Types  
import {
    IObservationWithShower,
    IObservationWithShowerLegacy,
    IShowerAtLocation,
    IShowerAtLocationLegacy
} from '../controllers/d.types';

export const convertDateToLegacy = ( date: Date): string => {
    // badly refactor dates just to exactly match the api-responds of the legacy version
    let dateString = date.toString().replace('+0000 (Greenwich Mean Time)' , '');
    const dateStringComps = dateString.split(' ');
    return dateStringComps[0] + ', ' + dateStringComps[2] + ' ' + dateStringComps[1]+ ' ' + dateStringComps[3]+ ' ' + dateStringComps[4] + ' ' + dateStringComps[5];
}

export const convertKeysFromSnakeToCamel = (rows: unknown[]) => {
    return rows.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((key: string) => {
            let  keyComponents = key.split('_');
            keyComponents = keyComponents.map((comp, index) => {
                if (index > 0) return captilizeFirstChar(comp);
                return comp;
            })
            const newKey = keyComponents.join('');
            newRow[newKey] = row[key];
        })
        return newRow;
    });
}

export const convertToLegacyFormat = ( rows: IObservationWithShowerLegacy[] | IShowerAtLocationLegacy[]): IObservationWithShower[] | IShowerAtLocation[] => {
    let newRows = rows as unknown[];

    // convert keys
    newRows = convertKeysFromSnakeToCamel(newRows);

    newRows = newRows.map((row) => {
        const newRow = row;
        Object.keys(newRow).forEach((key) => {
            switch(key) {
                case 'iauNo':
                    newRow[key] = Number(newRow[key]);
                    break;
                case 'date':
                    newRow[key] = convertDateToLegacy(new Date(newRow[key]));
                    break;
                case 'Unnamed: 0':
                    newRow[key] = Number(newRow[key]);
                    break;
                case 'start':
                    newRow[key] = (newRow[key] === null) ? '*' : newRow[key];
                    break;
                case 'end':
                    newRow[key] = (newRow[key] === null) ? '*' : newRow[key];
                    break;
                case 'peak':
                    newRow[key] = (newRow[key] === null) ? '*' : newRow[key];
                    break;
                case 'speed':
                    newRow[key] = (newRow[key] === null) ? '*' : newRow[key];
                    break;
                case 'freqPerHour':
                    newRow[key] = (newRow[key] === null) ? '*' : newRow[key];
                    break;
                default:
                    newRow[key] = newRow[key];
            }
        });
        return newRow;
    })

    return newRows as IObservationWithShower[];
}