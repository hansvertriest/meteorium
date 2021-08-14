// Node imports
import React, { FunctionComponent } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Store } from './services';

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

  return (
    <div className="App" >
      <Store localStorageKeys={['allowsCookies']}>
      <ApiProvider>
        <RouterComponent />
      </ApiProvider>
      </Store>

    </div>
  );
}

const RouterComponent: FunctionComponent = () => {
  const { GATracker } = useGA();

  return (
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
  );
}

export default App;
