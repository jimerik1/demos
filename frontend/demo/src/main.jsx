// Import React and ReactDOM the old way
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';

// Use ReactDOM.render() to mount your App component
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
