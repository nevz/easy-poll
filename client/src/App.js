import React, { useEffect } from 'react';
import './App.css';
import { NewPoll } from './';

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
    <div>
      <h3 className="p-3 text-center">Easy Polls</h3>
      <NewPoll />
    </div>
  );
}

export default App;
