// Node imports
import React from 'react';

// Component imports
import { Header, ButtonPrim } from '../../components';

// Asset imports
import cameraIcon from '../../assets/icons/camera-icon.svg';
import networkIcon from '../../assets/icons/network-icon.svg';
import participateIcon from '../../assets/icons/contribute-icon.svg';

// SCSS imports
import './AboutCams.scss';


const AboutCams: React.FunctionComponent<Record<string, never>> = () => {
    return (
        <div className="page-container cams">
        <Header />
        <div className="intro">
            <img src={cameraIcon}/>
            <div className="intro__main-text">
                <h1>What is CAMS?</h1>
                <p className="text"><a href="http://cams.seti.org" rel="noreferrer" target="_blank">Camera&apos;s for Allsky Meteor Surveillance</a> is a scientific research project by NASA, curated by Dr Peter Jenniskens. Using multiple networks of camera&apos;s, they record the night-sky, looking for shooting stars, a.k.a. meteors. By analysing footage of different angles of a meteor, lots of interesting properties can be calculated. For example it&apos;s speed, orbit and their origin in our solar system. Automating this process, allows researchers at the CAMS project to research a large volume of meteors every night. The goal of the project is to use this network of camera&apos;s to validate the already existing IAU Working List of Meteor Showers.</p>
            </div>
            <p className="intro__text-bg text">This visualisation has been created using only a fraction of the existing CAMS-data, which is publicly available. Because this dataset contains CAMS data from 2010 until 2016, there&apos;s still a lot of data which is not yet made public. If you&apos;d like to learn more, theres a scientific visualisation available <a href="http://cams.seti.org/FDL/" rel="noreferrer" target="_blank">here</a> using a larger and up-to-date dataset. </p>
        </div> 
        <div className="networks">
            <img src={networkIcon}/>
            <div className="networks__text">
                <h1>Camera Networks</h1>
                <p className="text">To better manage the recorded data and calculations, the total amount of camera&apos;s is split up into different networks. Because this application only uses data from 2010 to 2016 it uses data from only a few networks:</p>
                <ul>
                    <li>CAMS California</li>
                    <li>CAMS Florida</li>
                    <li>CAMS BeNeLux</li>
                    <li>CAMS Mid Atlantic</li>
                    <li>CAMS New Zealand</li>
                    <li>Lowell Observatory CAMS, Arizona</li>
                    <li>UAE Astronomical Camera Network</li>
                </ul>
                <p className="text">Since 2016 the amount of networks has tripled with networks in Africa, South-America, Australia and even more in the US. Now, the CAMS project consists of a total of 21 networks.</p>
            </div>
        </div>
        <div className="participate">
            <img src={participateIcon} />
            <h1>Participate</h1>
            <p className="participate__text-body text">CAMS is fuelled by a lot of independent volunteers keeping up their own camera&apos;s. If you&apos;d like to contribute to the project, you can do so by either adding a camera to an existing network or by starting a new network. In the first case you should contact your local network operator. If you&apos;d like to start a network by yourself you should contact Peter Jenisskens for more information. For official guidelines, instructions and software, click the button below.</p>
            <ButtonPrim text="Contribute" onClick={() => window.location.href = 'http://cams.seti.org/easyCAMS.html'} />
        </div>
        </div>
    );
} 

export default AboutCams;