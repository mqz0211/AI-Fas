import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Ensure this path matches the casing of your App.js file
import './style.css'; // Import your global stylesheet

// Create a root and render the App component into the 'root' div in index.html
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
