// Node imports
import React, { FunctionComponent } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

// Hook imports
import { 
  useGA 
} from './hooks';

// Component imports
import { ApiProvider } from './services';
import {
  SimulationPage,
  AboutMeteors,
  AboutCams
} from './pages';

import './App.css';

const App: FunctionComponent = () => {
  const { GATracker } = useGA();

  return (
    <div className="App" >
      <ApiProvider>
      <BrowserRouter basename='/'>
        <GATracker />
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
