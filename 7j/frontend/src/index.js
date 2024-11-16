import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Optional: Include styles if you have them
import App from './App'; // Import your App component

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // Render the app inside the div with id "root"
);
