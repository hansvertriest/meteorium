import React, { useState } from 'react';

// Components imports
import { Logo } from '../';

// SCSS import
import './Header.scss';

// Asset imports
import hamburgerIcon from '../../assets/icons/hamburger-icon.svg';
import cancelIcon from '../../assets/icons/cancel-icon.svg';

const Header: React.FunctionComponent<Record<string, never>> = () => {

    const [ menuIsVisible, setMenuIsVisbile ] = useState<boolean>(false);

    return(
        <div className="header">
            <Logo
                type={'horizontal'}
            />

            <img 
                // style={(menuIsVisible) ? {position: 'fixed', right: '-50px'} : {}}
                className="header__hamburger" 
                src={hamburgerIcon}
                onClick={() => setMenuIsVisbile(true)}
            />
            <div className="menu" style={(menuIsVisible) ? {right: '0'} : {right: '-500px'}}>
                <img src={cancelIcon}
                    onClick={() => setMenuIsVisbile(false)}
                />
                <div className="menu__links" >
                    <a href="/">View the meteorium</a>
                    <a href="/about-meteors">About meteors</a>
                    <a href="/about-cams">About the CAMS-project</a>
                </div>

                <div className="menu__contact" >
                    <p>Feedback? Questions?</p>
                    <a href="mailto:hans.vertriest@gmail.com">Contact me</a>
                    <p className="menu__references">
                    CAMS-data references<br/>P. Jenniskens, J. Baggaley, I. Crumpton, P. Aldous, P. Pokorny, D. Janches, P. S. Gural, D. Samuels, J. Albers, A. Howell, C. Johannink, M. Breukers, M. Odeh, N. Moskovitz, J. Collison, S. Ganju, 2018. A survey of southern hemisphere meteor showers. Planetary Space Science 154, 21–29.
                    </p>
                    <p className="menu__references">
                        Artevelde Hogeschool, Grafische en Digitale Media
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Header;