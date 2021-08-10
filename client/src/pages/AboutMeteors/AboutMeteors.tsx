// Node imports
import React from 'react';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// Component imports
import SliderCard from './Components/SliderCard';
import { Header } from '../../components';

// Asset imports
import shootingStarPicture from '../../assets/pictures/shooting-star.jpg';
import meteorShowerPicture from '../../assets/pictures/meteor-shower.jpg';
import meteorPicture from '../../assets/pictures/meteor.jpg';
import asteroidPicture from '../../assets/pictures/asteroid.jpeg';
import cometPicture from '../../assets/pictures/comet.jpg';

// SCSS imports
import './AboutMeteors.scss';
import 'swiper/swiper.scss';
import 'swiper/swiper.scss';
import 'swiper/components/pagination/pagination.scss';

SwiperCore.use([Pagination]);

const AboutMeteors: React.FunctionComponent<Record<string, never>> = () => {
    return (
        <div className="page-container meteors">
        <Header />
        <div id="shooting-stars" className="shooting-stars">
            <div className="shooting-stars__img-container">
                <img src={shootingStarPicture} />
                <p className="picture-label"><span>NASA/Ron Garan</span> | https://solarsystem.nasa.gov/resources/434/looking-down-on-a-shooting-star/?category=small-bodies_meteors-and-meteorites</p>
            </div>
            <div className="shooting-stars__text-container">
                <h1>What are<br/>shooting stars?</h1>
                <div className="body-text-container">
                    <p>Sometimes the earth moves into the orbit of a <a href="#smaller-objects">meteoroid</a>. As a result this small piece of space-debris makes it’s way into our atmosphere. There it  continiously bumps into air-molecules. Because of these interactions, the meteoroid heats up and leaves a clear trail of light in the sky. At this point it becomes what we call a meteor, or better known: a shooting star.</p>
                    <p>Different meteors consist of different chemical components. By looking at the color of the light trail we can gain some knowledge about what a  meteor is made of.</p>
                    <p>Meteoroids have often come a long way before they burn up in our atmosphere. So whenever you see a shooting star in the sky, you may be looking at a space rock coming all the way from Mars or Jupiter!</p>
                </div>
            </div>
        </div>
        <div id="smaller-objects" className="smaller-objects">
            <h1>Smaller objects in space</h1>
            <div className="smaller-objects__cards">
                <Swiper

                    slidesPerView={1.1}
                    centeredSlides={true}
                    spaceBetween={50}
                    // spaceBetween={}
                    navigation
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    preloadImages={true}
                    breakpoints={{
                        1500: {
                            slidesPerView:1.9,
                            // centeredSlides: false
                        },
                    }}
                >
                <SwiperSlide>
                    <SliderCard imgSrc={cometPicture}>
                        <h2>COMETS</h2>
                        <p>These are space objects moving in an elliptical orbit around the sun. Their core exists of ice, gas or dust. The size of this core can range from one to fifty kilometers across. </p>
                        <p>When a comet flies close to the sun, the core warms up and it starts to release gases. This produces a coma around the core and a gas tail. The latter always pointing directly away from the sun. A second tail is formed by this heating: a dust tail. This one caries meteoroids along the entire orbit of the comet. These two tails always point in a slightly different direction.</p>
                    </SliderCard>
                </SwiperSlide>
                <SwiperSlide>
                    <SliderCard imgSrc={asteroidPicture}>
                        <h2>ASTEROIDS</h2>
                        <p>All small space-objects orbiting the sun that do not have the characteristics of a comet are labeled asteroids. Their diameter varies between one meter and thousand kilometers. </p>
                        <h2>METEOROIDS</h2>
                        <p>A meteoroid is similar to an asteroid, but way smaller. They can be as tiny as a particle of sand. The bigger ones would be up to one meter across.</p>
                    </SliderCard>
                </SwiperSlide>
                </Swiper>

                
            </div>
        </div>
        <div className="smaller-objects-filler"></div>
        <div id="meteor-showers" className="meteor-showers">
            <div className="meteor-showers__img-container">
                <img src={meteorShowerPicture} />
                <p className="picture-label"><span>Michał Mancewicz </span> |  https://unsplash.com/@kreyatif</p>
            </div>
            <div className="meteor-showers__text-container">
                <h1>Meteor showers</h1>
                <div className="body-text-container">
                    <p>If a <a href="#smaller-objects">comet</a> gets close enough to the sun, it starts shedding a trail of space-debris or <a href="#smaller-objects">meteoroids</a> along it’s entire orbit. Whenever the earth passes through this trail, this large concentration of meteoroids end up burning up in our atmosphere. This results in a high frequency of <a href="#shooting-stars">meteors or shooting stars</a>.</p>
                    <p>So a meteor shower is an event where <a href="#smaller-objects">meteoroids</a> from a specific comet or other source cause a lot of <a href="#shooting-stars">shooting stars</a> on earth in a given period of time. A lot of meteor showers occur annually. When they do, each shower returns in the same period of the year.</p>
                </div>
            </div>
        </div>
        <div id="meteorites" className="meteorites">
            <div className="meteorites__img-container">
                <img src={meteorPicture} />
                <p className="picture-label"><span>NASA/JSC/ANSMET </span> |  https://solarsystem.nasa.gov/resources/2255/antarctic-meteorite/?category=small-bodies_meteors-and-meteorites</p>
            </div>
            <div className="meteorites__text-container">
                <h1>Meteorites</h1>
                <div className="body-text-container">
                    <p>Normally <a href="#shooting-stars">meteors</a> fully burn up even before they hit the ground. But some are so big, a part of those <a href="#shooting-stars">meteors</a> manage to survive and reach the ground. We call them meteorites. </p>    
                    <p>While most meteorites are small and don’t cause any harm, others may be larger. For example if an <a href="#smaller-objects">asteroid</a> of two kilometers across would hit the earth, it would probably wipe out a terrain the size of Germany or France. As a matter of fact, the earth was hit by an even larger <a href="#smaller-objects">asteroid</a> in the past. It was ten kilometers across and was known to extinct the dinosaurs.</p>
                    <p>However it is extremely unlikely that such event is to be happening within our lifetime as we have yet to discover an <a href="#smaller-objects">asteroid</a> of this size heading our way.</p>
                </div>
            </div>
        </div>
        </div>
    );
} 

export default AboutMeteors;