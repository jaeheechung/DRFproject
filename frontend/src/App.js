import './App.css';
import React from 'react';
import PostData from './component/PostData';
import GetData from './component/GetData';

function App() {
  return (
    <div className="App">
      <main>
        <GetData />
        <PostData />
      </main>
    </div>
  );
}

export default App;
