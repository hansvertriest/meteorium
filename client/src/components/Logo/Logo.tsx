// Node imports
import React, { FunctionComponent } from "react";
import { useHistory } from 'react-router-dom';

// Asset imports
import logo from '../../assets/logo.svg';

// SCSS imports
import './Logo.scss';

interface LogoProperties {
    type: string // vertical | horizontal
}

const Logo: FunctionComponent<LogoProperties> = ({type} : LogoProperties) => {
    const history = useHistory();
    
    return (
        <div 
            className={`logo logo--${type}`}
            onClick={() => history.push('/')}
        >
            <img src={logo} />
            <p>Meteorium</p>
        </div>
    );
}

export default Logo;