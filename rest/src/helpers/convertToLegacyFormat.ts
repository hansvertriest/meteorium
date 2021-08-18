
// Types  
import { IObservationWithShower, IObservationWithShowerLegacy } from '../controllers/d.types';

export const convertToLegacyFormat = ( rows: IObservationWithShower[]): IObservationWithShowerLegacy[] => {
    let newRows = rows as unknown[];

    // convert keys
    newRows = newRows.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((key: string) => {
            let  keyComponents = key.split('_');
            keyComponents = keyComponents.map((comp, index) => {
                if (index > 0) return comp.charAt(0).toUpperCase() + comp.slice(1);
                return comp;
            })
            const newKey = keyComponents.join('');
            newRow[newKey] = row[key];
        })
        return newRow;
    });

    newRows = newRows.map((row) => {
        const newRow = row;
        Object.keys(newRow).forEach((key) => {
            switch(key) {
                case 'iauNo':
                    newRow[key] = Number(newRow[key]);
                    break;
                case 'date':
                    // badly refactor dates just to exactly match the api-responds of the legacy version
                    let dateString =new Date(newRow[key]).toString().replace('+0000 (Greenwich Mean Time)' , '');
                    const dateStringComps = dateString.split(' ');
                    newRow[key] = dateStringComps[0] + ', ' + dateStringComps[2] + ' ' + dateStringComps[1]+ ' ' + dateStringComps[3]+ ' ' + dateStringComps[4] + ' ' + dateStringComps[5];
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

    return newRows as IObservationWithShowerLegacy[];
}