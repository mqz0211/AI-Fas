import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Note: importing App.js
import './style.css'; // Import your global stylesheet

// Create a root and render the App component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
