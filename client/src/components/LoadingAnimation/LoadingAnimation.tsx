import React from 'react';

// Asset imports
import icon from '../../assets/icons/loading-icon.svg';

// SCSS imports
import './LoadingAnimation.scss';

interface LoadingAnimation {
    width: number | undefined,
}

const LoadingAnimation: React.FunctionComponent<LoadingAnimation> = ({ width }: LoadingAnimation) => {
    return(
        <img 
            className="loading-animation"
            src={icon}
            style={{width: width+'px'}}
        />
    );
}

export default LoadingAnimation;