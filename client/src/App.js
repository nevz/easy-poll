import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


import './App.css';
import { NewPoll, Poll } from './';



function App() {


  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if(!userToken){
      const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('userToken', newToken);
    }
    console.log(userToken);
  }, [])

  return (
    <div className="App">
      <h3>Easy Polls</h3>
      <Router>
      <Switch>
                <Route path={`/:pollId/vote`}>
                  <Poll mode="vote"/>
                </Route>
                <Route path={`/:pollId/results`}>
                  <Poll mode="results"/>
                </Route>

                <Route path="/">
                  <NewPoll />
                </Route>
              </Switch>
      </Router>
            

    </div>
  );
}



export default App;
