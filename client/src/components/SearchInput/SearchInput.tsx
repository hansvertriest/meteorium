import React, { useState } from 'react';

// SCSS import
import './SearchInput.scss';

interface ISearchInputProps {
    id: string,
    defaultValue: string | undefined,
    placeholder: string,
    fetchResults: (searchTerm: string) => Promise<{value: string, id: string}[]>,
    onSelect: (id: string, name: string) => void, 
}

const SearchInput: React.FunctionComponent<ISearchInputProps> = ({ id, defaultValue, placeholder, fetchResults, onSelect }: ISearchInputProps) => {
    const [ showResults, setShowResults ] = useState<boolean>(false);
    const [ results, setResults ] = useState<{value: string, id: string}[]>([]);

    const renderResults = () => {
        return results.map((result, index) => {
            return <p 
                key={'result-'+index} 
                value-id={result.id}
                onMouseDown={() => {
                    onSelect(result.id, result.value);
                    console.log(result);
                    const input = document.getElementById(id) as HTMLInputElement;
                    if (input) input.value = result.value;
                }}
            >{result.value}</p>
        });
    }

    return(
        <div className="search-input">
            <input 
                type="text" 
                autoComplete="off"

                id={id}
                placeholder={placeholder}
                defaultValue={defaultValue}

                onChange={async (e) => {
                    if (e.target.value && e.target.value !== '') {
                        const newResults = await fetchResults(e.target.value);
                        setResults(newResults);
                        setShowResults(true);
                    }
                }}
                onBlur={() => {
                    setShowResults(false)
                }}
                onFocus={() => setShowResults(true)}
            />
            {
                (showResults && results.length)
                ? <div className="search-input__results">
                    {renderResults()}
                </div>
                : null
            }
        </div>
    );
}

export default SearchInput;