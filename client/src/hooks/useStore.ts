import { useContext } from "react";
import { storeContext } from '../services';

const useStore = (key: string): {
    value: any,
    set: (value: any) => void,
    clear: () => void,
 } => {
    const ctx = useContext(storeContext);

    if (ctx === undefined) {
        throw new Error('useStore must be used within a Provider');
    } 

    const {dispatch, content, localStorageKeys} = ctx;

    const value = content[key];
    const storageType = (localStorageKeys.includes(key)) ? 'local' : 'volatile';

    /**
     * Sets the value of the defined key
     * @param value value for predefined key
     */
    const set = (value: any ) => {
        dispatch({type:'set', payload: {key, value, storageType }})
    }

    /**
     * removes the predefined key
     */
    const clear = () => {
        dispatch({type:'remove', payload: {key, value, storageType}});
    }

    return {value, set, clear};
}

export default useStore;

