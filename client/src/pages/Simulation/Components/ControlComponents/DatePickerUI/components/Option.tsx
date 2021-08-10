import React from 'react';

// SCSS imports
import './Option.scss';

interface IOptionProperties {
    type: string, // year / month / day
    label: string,
    count: number | string,
    width: number,
    onClick: () => void,
}

const Option: React.FunctionComponent<IOptionProperties> = ({ type, label, count, width, onClick }: IOptionProperties) => {
    return (
        <div className={`${type}-option`}>
            <div 
                className={`top-${type}-option-bar-container`}
                onClick={onClick}
            > 
                <div 
                    className={`${type}-option-bar`}
                    style={{width: 25 + width*0.75+'%'}}
                ></div>
                <p className="noselect">{label}</p>
                <p className="option-description">{count} <span> meteors</span></p>
            </div>
        </div>
    );
}

export default Option;