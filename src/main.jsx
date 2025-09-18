
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Register from './Register.jsx';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/users/login" replace />} />
        <Route path="/users/login" element={<App />} />
        <Route path="/users/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
