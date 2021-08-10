// Node imports
import React, { FunctionComponent } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

// Component imports
import { ApiProvider } from './services';
import {
  SimulationPage,
  AboutMeteors,
  AboutCams
} from './pages';

import './App.css';

const App: FunctionComponent = () => {
  return (
    <div className="App" >
      <ApiProvider>
      <BrowserRouter basename='/'>
        <Switch>
          <Route path="/about-meteors">
            <AboutMeteors />
          </Route>
          <Route path="/about-cams">
            <AboutCams />
          </Route>
          <Route path="/">
            <SimulationPage />
          </Route>
        </Switch>
      </BrowserRouter>
      </ApiProvider>

    </div>
  );
}

export default App;
