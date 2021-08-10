import React from 'react';

// SCSS imports
import './OptionLoading.scss';

interface OptionProperties {
    key: string
}


const Option: React.FunctionComponent<OptionProperties> = ({ key }: OptionProperties) => {
    return (
        <div className={`option-loading`} key={key}>
            <div 
                className={`option-bar-container`}
            > 
                <div className={`option-bar`}></div>
                <p className="noselect"></p>
                <p className="option-description"></p>
            </div>
        </div>
    );
}

export default Option;