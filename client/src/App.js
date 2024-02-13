import React from 'react';
import Chat from './components/Chat';
import './index.css';

function App() {
  return (
    <div className="App">
      <div class="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <Chat />
    </div>
  );
}

export default App;
