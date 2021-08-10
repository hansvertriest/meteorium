import React from 'react';

// SCSS imports
import './SliderCard.scss';

interface SliderCardProperties {
    imgSrc: string,
    children: JSX.Element[]
}

const SliderCard: React.FunctionComponent<SliderCardProperties> = ({ imgSrc, children }: SliderCardProperties) => {
    return (
        <div className="slider-card">
            <img className="slider-card__img" src={imgSrc} />
            <div className="slider-card__text-container">
                {children}
            </div>
        </div>
    );
}

export default SliderCard;