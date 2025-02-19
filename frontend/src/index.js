// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';              // Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js';          // Bootstrap JS bundle (with Popper)
import './App.css';                                          // Custom CSS

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
