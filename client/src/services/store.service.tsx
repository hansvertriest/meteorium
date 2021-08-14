import { default as React, createContext, useReducer, useEffect } from "react";


export const StoreInitialState = {
    content: {} as {[key:string]: any},
    dispatch: {} as React.Dispatch<{
        type: 'set' | 'remove' | 'init';
        payload: {
            key: string;
            value:  any;
            storageType: 'volatile' | 'local'
        },
    }>,
    localStorageKeys: [] as string[],
  }

export const storeContext = createContext<typeof StoreInitialState>(StoreInitialState);

const reducer = (
    state: {[key:string]: any},
    action: {
        type: 'set' | 'remove' | 'init',
        payload: {key: string, value: any, storageType: 'volatile' | 'local'},
    }
) => {
  const {key, value, storageType} = action.payload;

  const parsedValue = (typeof value === 'string') ? value : JSON.stringify(value) 
  
  // check if state correct parameters where passed
  if ( !state || !action?.type) {
    throw new Error("Insufficient parameters passed to reducer")
  }

  switch (action.type) {
    case 'set':
      // only trigger re-render if the newValue differs from the original one
      if (state[key] !== value) {
        if (storageType === 'local') localStorage.setItem(key, parsedValue)
        return { ...state, [key]: value }
      } 
      return state
    case 'remove':
      // only trigger re-render if the key actually already exists
      if (state[key]) {
        if (storageType === 'local') localStorage.removeItem(key)
        return { ...state, [key]: undefined }
      }
      return state
    case 'init':
      // add key to the state
      return { ...state, [key]: value }
    default:
        throw new Error("Invalid action type passed to reducer.")
  }
}

const Store: React.FC<{ localStorageKeys: string[] }> =
(
    { children, localStorageKeys } : React.PropsWithChildren<{ localStorageKeys: string[]}>
) => {
    const [content, dispatch] = useReducer(reducer, {} )

    useEffect(() => {
        // find which persistenKeys already exist in localStorage and init them through the reducer
        localStorageKeys.forEach((key: string) => {
            const value = localStorage.getItem(key)
            if (value) {
                const parsedValue = (value === "false" || value === "true") ? JSON.parse(value) : value
                dispatch({type:'init', payload: {key, value: parsedValue, storageType: 'local'}})
            }
          })
      }, [localStorageKeys])

    return (
        <storeContext.Provider value={{
            dispatch,
            content,
            localStorageKeys: localStorageKeys,
        }}>
            {children}
        </storeContext.Provider>
    );
}

export default Store;